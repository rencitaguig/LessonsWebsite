// seed.js - Universal quiz seeder
const fs = require('fs');
const path = require('path');

const targetFile = process.argv[2] 
  ? path.resolve(process.argv[2])
  : path.join(__dirname, 'backend', 'seeds', 'robotics-L1-L4-quiz.json');

const apiUrl = process.env.API_URL || 'http://localhost:5000/api/quizzes';
const topicsUrl = process.env.TOPICS_URL || 'http://localhost:5000/api/topics';

async function main() {
  if (!fs.existsSync(targetFile)) {
    console.error(`File not found: ${targetFile}`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
  const quizzes = Array.isArray(rawData) ? rawData : [rawData];

  console.log(`Found ${quizzes.length} quiz(zes) to seed from: ${path.basename(targetFile)}`);

  // Fetch topics to allow fallback auto-mapping by title if needed
  let topics = [];
  try {
    const res = await fetch(topicsUrl);
    if (res.ok) topics = await res.json();
  } catch (err) {
    // Ignore, proceed with specified IDs
  }

  let successCount = 0;

  for (let i = 0; i < quizzes.length; i++) {
    const q = quizzes[i];

    // Find topic ID
    let topicId = q.topic_id || q.topicId;
    if (!topicId && topics.length > 0) {
      const match = topics.find(t => q.title.includes(t.title) || t.title.includes(q.title.replace(/\s*Quiz\s*$/i, '')));
      if (match) topicId = match.id;
    }

    if (!topicId) {
      console.error(`[${i + 1}/${quizzes.length}] Skipped "${q.title}": No matching topic ID found.`);
      continue;
    }

    // Normalize question format to match backend expectations
    const questions = (q.questions || []).map(question => ({
      questionText: question.question_text || question.questionText,
      points: Number(question.points) || 1,
      options: (question.options || []).map(opt => ({
        text: opt.text || opt.option_text,
        isCorrect: Boolean(opt.is_correct !== undefined ? opt.is_correct : opt.isCorrect)
      }))
    }));

    const payload = {
      topicId: Number(topicId),
      title: q.title,
      passingScore: Number(q.passing_score !== undefined ? q.passing_score : (q.passingScore || 60)),
      questions
    };

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(`[${i + 1}/${quizzes.length}] Failed to seed "${q.title}" (Topic ${topicId}):`, data);
      } else {
        console.log(`[${i + 1}/${quizzes.length}] OK: "${q.title}" -> Topic ID ${topicId} (Quiz ID ${data.id})`);
        successCount++;
      }
    } catch (err) {
      console.error(`[${i + 1}/${quizzes.length}] Network error seeding "${q.title}":`, err.message);
    }
  }

  console.log(`\nDone! Successfully seeded ${successCount} of ${quizzes.length} quizzes.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
