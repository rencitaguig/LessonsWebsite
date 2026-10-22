// backend/seeds/seed-quiz.js
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, 'quiz_topic_32.json');
const apiUrl = process.env.API_URL || 'http://localhost:5000/api/quizzes';

async function seed() {
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`Seeding quiz "${payload.title}" to topic ID ${payload.topicId}...`);

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Error seeding quiz:', data);
    process.exit(1);
  }

  console.log('Quiz successfully seeded:', data);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
