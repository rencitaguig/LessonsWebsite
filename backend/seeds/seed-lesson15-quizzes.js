const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || 'http://localhost:5001';
const quizFile = path.join(__dirname, 'lesson15-robotic-manipulation-quizzes.json');
const parentTopicTitle = 'Robotic Manipulation and Grasping';

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(data)}`);
  }
  return data;
}

// Quizzes target subtopics by title: "L15.1 — Robotic Arm Structure Quiz" -> "L15.1 — Robotic Arm Structure"
function subtopicTitle(quizTitle) {
  return quizTitle.replace(/\s+Quiz$/, '');
}

async function seed() {
  const quizzes = JSON.parse(fs.readFileSync(quizFile, 'utf8'));
  const topics = await requestJson(`${apiUrl}/api/topics`);
  const parent = topics.find((topic) => topic.title === parentTopicTitle && topic.parent_topic_id == null);

  if (!parent) {
    throw new Error(`Parent topic "${parentTopicTitle}" was not found.`);
  }

  const targets = quizzes.map((quiz) => ({
    quiz,
    topic: topics.find((item) => item.title === subtopicTitle(quiz.title) && item.parent_topic_id === parent.id)
  }));

  for (const { quiz, topic } of targets) {
    if (!topic) {
      throw new Error(`Subtopic "${subtopicTitle(quiz.title)}" was not found under "${parentTopicTitle}".`);
    }
    if (topic.quiz_id) {
      throw new Error(`A quiz is already assigned to "${topic.title}"; refusing to replace it.`);
    }
    if (quiz.questions.length !== 5) {
      throw new Error(`"${quiz.title}" must contain exactly five questions.`);
    }
  }

  for (const { quiz, topic } of targets) {
    const result = await requestJson(`${apiUrl}/api/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId: topic.id, title: quiz.title, passingScore: quiz.passingScore, questions: quiz.questions })
    });
    console.log(`Inserted quiz ${result.id} for topic ${result.topicId}: ${result.title}`);
  }
}

seed().catch((error) => {
  console.error('Lesson 15 quiz seeding failed:', error);
  process.exitCode = 1;
});
