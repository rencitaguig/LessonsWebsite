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

async function seed() {
  const quizzes = JSON.parse(fs.readFileSync(quizFile, 'utf8'));
  const topics = await requestJson(`${apiUrl}/api/topics`);
  const parent = topics.find((topic) => topic.title === parentTopicTitle && topic.parent_topic_id == null);

  if (!parent) {
    throw new Error(`Parent topic "${parentTopicTitle}" was not found.`);
  }

  for (const quiz of quizzes) {
    const topic = topics.find((item) => item.id === quiz.topicId);
    if (!topic || topic.parent_topic_id !== parent.id) {
      throw new Error(`Topic ID ${quiz.topicId} is not a subtopic of "${parentTopicTitle}".`);
    }
    if (topic.quiz_id) {
      throw new Error(`A quiz is already assigned to "${topic.title}"; refusing to replace it.`);
    }
    if (quiz.questions.length !== 5) {
      throw new Error(`"${quiz.title}" must contain exactly five questions.`);
    }
  }

  for (const quiz of quizzes) {
    const result = await requestJson(`${apiUrl}/api/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quiz)
    });
    console.log(`Inserted quiz ${result.id} for topic ${result.topicId}: ${result.title}`);
  }
}

seed().catch((error) => {
  console.error('Lesson 15 quiz seeding failed:', error);
  process.exitCode = 1;
});
