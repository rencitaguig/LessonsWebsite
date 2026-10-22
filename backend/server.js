const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const db = require('./db');

const app = express();
const uploadDirectory = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const topicImageUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (_req, file, callback) => {
      callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, file.mimetype.startsWith('image/'));
  }
});

const topicImagesUpload = multer({
  storage: topicImageUpload.storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: topicImageUpload.fileFilter
});

const imagePositions = new Set(['top', 'bottom', 'left', 'right']);

function isValidTextSize(size, minimum, maximum) {
  return Number.isInteger(Number(size)) && Number(size) >= minimum && Number(size) <= maximum;
}

function isValidImageWidth(width) {
  return Number.isInteger(Number(width)) && Number(width) >= 25 && Number(width) <= 100;
}

function removeUploadedImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
    return;
  }

  const imagePath = path.join(uploadDirectory, path.basename(imageUrl));
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
}

async function getTopicImages(topicId) {
  const [images] = await db.query(
    'SELECT id, image_url, image_position, image_width, sort_order FROM topic_images WHERE topic_id = ? ORDER BY sort_order ASC, id ASC',
    [topicId]
  );
  return images;
}

async function getTopicQuiz(topicId) {
  const [quizRows] = await db.query(
    'SELECT id, title, passing_score FROM quizzes WHERE topic_id = ?',
    [topicId]
  );
  if (quizRows.length === 0) {
    return null;
  }

  const [questionRows] = await db.query(
    'SELECT id, question_text, points, sort_order FROM quiz_questions WHERE quiz_id = ? ORDER BY sort_order, id',
    [quizRows[0].id]
  );
  const questions = await Promise.all(questionRows.map(async (question) => {
    const [options] = await db.query(
      'SELECT id, option_text, sort_order FROM quiz_options WHERE question_id = ? ORDER BY sort_order, id',
      [question.id]
    );
    return { ...question, options };
  }));

  return { ...quizRows[0], questions };
}

async function addTopicImages(topicId, files, positions = []) {
  for (const [index, file] of files.entries()) {
    const imagePosition = positions[index]?.position || 'top';
    const imageWidth = Number(positions[index]?.width || 100);
    await db.query(
      'INSERT INTO topic_images (topic_id, image_url, image_position, image_width, sort_order) VALUES (?, ?, ?, ?, ?)',
      [topicId, `/uploads/${file.filename}`, imagePosition, imageWidth, index]
    );
  }
}

function parsePositionList(value) {
  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    const trimmed = String(value).trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      return trimmed.slice(1, -1).split(',').map((position) => position.trim()).filter(Boolean);
    }
  }

  return null;
}

app.use(cors());
app.use('/uploads', express.static(uploadDirectory));

// Required to read req.body as JSON
app.use(express.json());

app.post('/api/content-images', topicImageUpload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'An image is required.' });
  }

  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// 1. Signup Route
app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password, role = 'user' } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Check if user already exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username or Email already taken.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Save to database
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, role]
    );

    const newUser = {
      id: result.insertId,
      username,
      email,
      role
    };

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Topic routes
app.get('/api/topics', async (req, res) => {
  try {
    const [topicRows] = await db.query(
      `SELECT topics.id, topics.parent_topic_id, topics.title, topics.slug, topics.content,
          topics.title_text_size, topics.content_text_size, topics.youtube_url, topics.image_url, topics.image_position,
          quizzes.id AS quiz_id, quizzes.title AS quiz_title
       FROM topics
       LEFT JOIN quizzes ON quizzes.topic_id = topics.id
      ORDER BY topics.parent_topic_id IS NOT NULL, topics.created_at ASC, topics.id ASC`
    );
    const topics = await Promise.all(topicRows.map(async (topic) => ({
      ...topic,
      images: await getTopicImages(topic.id)
    })));
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/topics/:topicId/quiz', async (req, res) => {
  try {
    const [topics] = await db.query(
      'SELECT id, parent_topic_id, title, slug, content, title_text_size, content_text_size, youtube_url, image_url, image_position FROM topics WHERE id = ?',
      [req.params.topicId]
    );
    const topic = topics[0];

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found.' });
    }

    const [subtopicRows] = await db.query(
      `SELECT topics.id, topics.parent_topic_id, topics.title, topics.slug, topics.content,
          topics.title_text_size, topics.content_text_size, topics.youtube_url, topics.image_url, topics.image_position,
          quizzes.id AS quiz_id
       FROM topics
       LEFT JOIN quizzes ON quizzes.topic_id = topics.id
       WHERE topics.parent_topic_id = ?
       ORDER BY topics.created_at ASC, topics.id ASC`,
      [topic.id]
    );
    const images = await getTopicImages(topic.id);
    const subtopics = await Promise.all(subtopicRows.map(async (subtopic) => ({
      ...subtopic,
      images: await getTopicImages(subtopic.id),
      quiz: subtopic.quiz_id ? await getTopicQuiz(subtopic.id) : null
    })));

    const quiz = await getTopicQuiz(topic.id);

    res.json({ topic: { ...topic, images, subtopics }, quiz });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/topics', topicImagesUpload.array('images', 10), async (req, res) => {
  const { authorId, parentTopicId = null, title, slug, content, titleTextSize = 24, contentTextSize = 16, youtubeUrl = '', imagePositions: imagePositionsJson = '[]' } = req.body;
  const files = req.files || [];
  const positions = parsePositionList(imagePositionsJson);
  const authorIdNumber = Number(authorId);
  const parentTopicIdNumber = parentTopicId === '' || parentTopicId === null ? null : Number(parentTopicId);

  if (!Number.isInteger(authorIdNumber) || !title || !slug || !content) {
    return res.status(400).json({ error: 'Author, title, slug, and content are required.' });
  }

  if (!isValidTextSize(titleTextSize, 16, 64) || !isValidTextSize(contentTextSize, 12, 32)) {
    return res.status(400).json({ error: 'Title size must be 16-64 and content size must be 12-32.' });
  }

  if (parentTopicIdNumber !== null && (!Number.isInteger(parentTopicIdNumber) || parentTopicIdNumber <= 0)) {
    return res.status(400).json({ error: 'Parent topic must be a valid topic id.' });
  }

  if (!Array.isArray(positions) || positions.length !== files.length || positions.some((image) => !imagePositions.has(image.position) || !isValidImageWidth(image.width))) {
    return res.status(400).json({ error: 'Each image must have a valid position and width between 25 and 100.' });
  }

  try {
    if (parentTopicIdNumber !== null) {
      const [parentTopics] = await db.query(
        'SELECT id FROM topics WHERE id = ? AND parent_topic_id IS NULL',
        [parentTopicIdNumber]
      );
      if (parentTopics.length === 0) {
        return res.status(400).json({ error: 'Parent topic must be an existing top-level topic.' });
      }
    }

    const [result] = await db.query(
      'INSERT INTO topics (author_id, parent_topic_id, title, slug, content, title_text_size, content_text_size, youtube_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [authorIdNumber, parentTopicIdNumber, title, slug, content, titleTextSize, contentTextSize, youtubeUrl || null]
    );
    await addTopicImages(result.insertId, files, positions);
    const images = await getTopicImages(result.insertId);

    res.status(201).json({
      id: result.insertId,
      authorId: authorIdNumber,
      parentTopicId: parentTopicIdNumber,
      title,
      slug,
      content,
      titleTextSize: Number(titleTextSize),
      contentTextSize: Number(contentTextSize),
      youtubeUrl: youtubeUrl || null,
      images
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/topics/:topicId', topicImagesUpload.array('images', 10), async (req, res) => {
  const topicId = Number(req.params.topicId);
  const { authorId, parentTopicId = null, title, slug, content, titleTextSize = 24, contentTextSize = 16, youtubeUrl = '', removeImageIds = '[]', imageUpdates = '[]', imagePositions: imagePositionsJson = '[]' } = req.body;
  const files = req.files || [];
  let imagesToRemove;
  let existingImageUpdates;
  const parsedPositions = parsePositionList(imagePositionsJson);
  try {
    imagesToRemove = JSON.parse(removeImageIds);
    existingImageUpdates = JSON.parse(imageUpdates);
  } catch {
    return res.status(400).json({ error: 'Image changes must be valid JSON.' });
  }
  const positions = parsedPositions;
  const authorIdNumber = Number(authorId);
  const parentTopicIdNumber = parentTopicId === '' || parentTopicId === null ? null : Number(parentTopicId);

  if (!Number.isInteger(topicId) || topicId <= 0) {
    return res.status(400).json({ error: 'Topic id must be a valid number.' });
  }

  if (!Number.isInteger(authorIdNumber) || !title || !slug || !content) {
    return res.status(400).json({ error: 'Author, title, slug, and content are required.' });
  }

  if (!isValidTextSize(titleTextSize, 16, 64) || !isValidTextSize(contentTextSize, 12, 32)) {
    return res.status(400).json({ error: 'Title size must be 16-64 and content size must be 12-32.' });
  }

  if (parentTopicIdNumber !== null && (!Number.isInteger(parentTopicIdNumber) || parentTopicIdNumber <= 0)) {
    return res.status(400).json({ error: 'Parent topic must be a valid topic id.' });
  }

  if (!Array.isArray(imagesToRemove) || !Array.isArray(existingImageUpdates) || !Array.isArray(positions) || positions.length !== files.length || positions.some((image) => !imagePositions.has(image.position) || !isValidImageWidth(image.width)) || existingImageUpdates.some((image) => !imagePositions.has(image.position) || !isValidImageWidth(image.width))) {
    return res.status(400).json({ error: 'Image changes contain invalid data.' });
  }

  try {
    const [existingTopics] = await db.query('SELECT id FROM topics WHERE id = ?', [topicId]);
    if (existingTopics.length === 0) {
      return res.status(404).json({ error: 'Topic not found.' });
    }

    if (parentTopicIdNumber !== null) {
      const [parentTopics] = await db.query(
        'SELECT id FROM topics WHERE id = ? AND parent_topic_id IS NULL AND id <> ?',
        [parentTopicIdNumber, topicId]
      );
      if (parentTopics.length === 0) {
        return res.status(400).json({ error: 'Parent topic must be an existing top-level topic.' });
      }
    }

    await db.query(
      'UPDATE topics SET author_id = ?, parent_topic_id = ?, title = ?, slug = ?, content = ?, title_text_size = ?, content_text_size = ?, youtube_url = ? WHERE id = ?',
      [authorIdNumber, parentTopicIdNumber, title, slug, content, titleTextSize, contentTextSize, youtubeUrl || null, topicId]
    );
    for (const update of existingImageUpdates) {
      if (Number.isInteger(Number(update.id)) && imagePositions.has(update.position) && isValidImageWidth(update.width)) {
        await db.query('UPDATE topic_images SET image_position = ?, image_width = ? WHERE id = ? AND topic_id = ?', [update.position, update.width, update.id, topicId]);
      }
    }
    if (imagesToRemove.length > 0) {
      const [removedImages] = await db.query('SELECT image_url FROM topic_images WHERE topic_id = ? AND id IN (?)', [topicId, imagesToRemove]);
      await db.query('DELETE FROM topic_images WHERE topic_id = ? AND id IN (?)', [topicId, imagesToRemove]);
      removedImages.forEach((image) => removeUploadedImage(image.image_url));
    }
    await addTopicImages(topicId, files, positions);
    const images = await getTopicImages(topicId);

    res.json({ id: topicId, authorId: authorIdNumber, parentTopicId: parentTopicIdNumber, title, slug, content, titleTextSize: Number(titleTextSize), contentTextSize: Number(contentTextSize), youtubeUrl: youtubeUrl || null, images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/topics/:topicId', async (req, res) => {
  const topicId = Number(req.params.topicId);

  if (!Number.isInteger(topicId) || topicId <= 0) {
    return res.status(400).json({ error: 'Topic id must be a valid number.' });
  }

  try {
    const [topicImages] = await db.query('SELECT image_url FROM topic_images WHERE topic_id = ?', [topicId]);
    const [result] = await db.query('DELETE FROM topics WHERE id = ?', [topicId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Topic not found.' });
    }

    topicImages.forEach((image) => removeUploadedImage(image.image_url));

    res.json({ message: 'Topic deleted successfully.', id: topicId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/api/quizzes', async (req, res) => {
  const { topicId, title, passingScore = 60, questions } = req.body;
  const topicIdNumber = Number(topicId);
  const passingScoreNumber = Number(passingScore);

  if (!Number.isInteger(topicIdNumber) || !title || !Array.isArray(questions) || questions.length === 0 || passingScoreNumber < 0 || passingScoreNumber > 100) {
    return res.status(400).json({ error: 'Topic, title, passing score, and at least one question are required.' });
  }

  if (questions.some((question) => !question.questionText || !Number.isInteger(Number(question.points)) || Number(question.points) < 1 || !Array.isArray(question.options) || question.options.length < 2 || question.options.filter((option) => option.isCorrect).length !== 1 || question.options.some((option) => !option.text))) {
    return res.status(400).json({ error: 'Each question needs text, points, at least two options, and exactly one correct answer.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [topicRows] = await connection.query('SELECT id FROM topics WHERE id = ?', [topicIdNumber]);
    if (topicRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Topic not found.' });
    }

    const [existingQuizzes] = await connection.query('SELECT id FROM quizzes WHERE topic_id = ?', [topicIdNumber]);
    if (existingQuizzes.length > 0) {
      await connection.query('DELETE FROM quizzes WHERE id = ?', [existingQuizzes[0].id]);
    }
    const [quizResult] = await connection.query(
      'INSERT INTO quizzes (topic_id, title, passing_score) VALUES (?, ?, ?)',
      [topicIdNumber, title, passingScoreNumber]
    );
    for (const [questionIndex, question] of questions.entries()) {
      const [questionResult] = await connection.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order) VALUES (?, ?, ?, ?)',
        [quizResult.insertId, question.questionText, Number(question.points), questionIndex]
      );
      for (const [optionIndex, option] of question.options.entries()) {
        await connection.query(
          'INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES (?, ?, ?, ?)',
          [questionResult.insertId, option.text, Boolean(option.isCorrect), optionIndex]
        );
      }
    }
    await connection.commit();
    res.status(201).json({ id: quizResult.insertId, topicId: topicIdNumber, title, passingScore: passingScoreNumber });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

app.get('/api/quizzes/:quizId', async (req, res) => {
  const quizId = Number(req.params.quizId);

  if (!Number.isInteger(quizId) || quizId <= 0) {
    return res.status(400).json({ error: 'Quiz id must be a valid number.' });
  }

  try {
    const [quizRows] = await db.query(
      'SELECT id, topic_id, title, passing_score FROM quizzes WHERE id = ?',
      [quizId]
    );
    if (quizRows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    const [questionRows] = await db.query(
      'SELECT id, question_text, points, sort_order FROM quiz_questions WHERE quiz_id = ? ORDER BY sort_order, id',
      [quizId]
    );
    const questions = await Promise.all(questionRows.map(async (question) => {
      const [options] = await db.query(
        'SELECT id, option_text, is_correct, sort_order FROM quiz_options WHERE question_id = ? ORDER BY sort_order, id',
        [question.id]
      );
      return { ...question, options };
    }));

    res.json({ ...quizRows[0], questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/quizzes/:quizId/submit', async (req, res) => {
  const quizId = Number(req.params.quizId);
  const userId = Number(req.body.userId);
  const answers = req.body.answers || {};

  try {
    const [quizRows] = await db.query('SELECT id, passing_score FROM quizzes WHERE id = ?', [quizId]);
    if (quizRows.length === 0) return res.status(404).json({ error: 'Quiz not found.' });
    const [questions] = await db.query('SELECT id, points FROM quiz_questions WHERE quiz_id = ?', [quizId]);
    let score = 0;
    let totalPoints = 0;
    const correctAnswers = {};
    for (const question of questions) {
      totalPoints += question.points;
      const [correct] = await db.query('SELECT id FROM quiz_options WHERE question_id = ? AND is_correct = TRUE', [question.id]);
      if (correct.length > 0) {
        correctAnswers[question.id] = correct[0].id;
        if (Number(answers[question.id]) === correct[0].id) score += question.points;
      }
    }
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const passed = percentage >= Number(quizRows[0].passing_score);
    if (Number.isInteger(userId) && userId > 0) {
      await db.query(
        'INSERT INTO quiz_attempts (user_id, quiz_id, score, total_points, passed) VALUES (?, ?, ?, ?, ?)',
        [userId, quizId, score, totalPoints, passed]
      );
    }
    res.json({ score, totalPoints, passed, percentage, correctAnswers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/quizzes/:quizId', async (req, res) => {
  const quizId = Number(req.params.quizId);

  if (!Number.isInteger(quizId) || quizId <= 0) {
    return res.status(400).json({ error: 'Quiz id must be a valid number.' });
  }

  try {
    const [result] = await db.query('DELETE FROM quizzes WHERE id = ?', [quizId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }
    res.json({ message: 'Quiz deleted successfully.', id: quizId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:userId/attempts', async (req, res) => {
  try {
    const [attempts] = await db.query(
      `SELECT attempts.id, attempts.score, attempts.total_points, attempts.passed,
              attempts.completed_at, quizzes.title AS quiz_title
       FROM quiz_attempts attempts
       JOIN quizzes ON quizzes.id = attempts.quiz_id
       WHERE attempts.user_id = ?
       ORDER BY attempts.completed_at DESC`,
      [req.params.userId]
    );
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});