USE learn_schema;

CREATE TABLE IF NOT EXISTS topic_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  image_position ENUM('top', 'bottom', 'left', 'right') NOT NULL DEFAULT 'top',
  image_width TINYINT UNSIGNED NOT NULL DEFAULT 100,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT topic_images_topic_fk FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

INSERT INTO topic_images (topic_id, image_url, image_position, sort_order)
SELECT id, image_url, image_position, 0
FROM topics
WHERE image_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM topic_images WHERE topic_images.topic_id = topics.id
  );