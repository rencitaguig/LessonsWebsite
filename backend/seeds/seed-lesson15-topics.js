const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || 'http://localhost:5001';
const topicsFile = path.join(__dirname, 'lesson15-topics.json');
const adminEmail = process.env.ADMIN_EMAIL || 'admin@lessonswebsite.local';
const adminPassword = process.env.ADMIN_PASSWORD || '123';

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(data)}`);
  }
  return data;
}

function postJson(pathname, body) {
  return requestJson(`${apiUrl}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function resolveAuthorId() {
  const envAuthorId = Number(process.env.AUTHOR_ID);
  if (Number.isInteger(envAuthorId) && envAuthorId > 0) {
    return envAuthorId;
  }
  const login = await postJson('/api/auth/login', { email: adminEmail, password: adminPassword });
  return login.user.id;
}

async function seed() {
  const { parent, subtopics } = JSON.parse(fs.readFileSync(topicsFile, 'utf8'));
  const authorId = await resolveAuthorId();
  const topics = await requestJson(`${apiUrl}/api/topics`);

  let parentTopic = topics.find((topic) => topic.title === parent.title && topic.parent_topic_id == null);
  if (parentTopic) {
    console.log(`Parent topic already exists (${parentTopic.id}): ${parent.title}`);
  } else {
    parentTopic = await postJson('/api/topics', {
      authorId,
      title: parent.title,
      slug: parent.slug,
      content: parent.content,
      titleTextSize: parent.titleTextSize,
      contentTextSize: parent.contentTextSize
    });
    console.log(`Created parent topic ${parentTopic.id}: ${parent.title}`);
  }

  for (const subtopic of subtopics) {
    const existing = topics.find(
      (topic) => topic.slug === subtopic.slug || (topic.title === subtopic.title && topic.parent_topic_id === parentTopic.id)
    );
    if (existing) {
      console.log(`Skipping existing subtopic (${existing.id}): ${subtopic.title}`);
      continue;
    }
    const created = await postJson('/api/topics', {
      authorId,
      parentTopicId: parentTopic.id,
      title: subtopic.title,
      slug: subtopic.slug,
      content: subtopic.content,
      titleTextSize: subtopic.titleTextSize,
      contentTextSize: subtopic.contentTextSize
    });
    console.log(`Created subtopic ${created.id}: ${subtopic.title}`);
  }
}

seed().catch((error) => {
  console.error('Lesson 15 topic seeding failed:', error);
  process.exitCode = 1;
});
