USE learn_schema;

SET @youtube_url_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'topics'
    AND COLUMN_NAME = 'youtube_url'
);

SET @add_youtube_url_column = IF(
  @youtube_url_column_exists = 0,
  'ALTER TABLE topics ADD COLUMN youtube_url VARCHAR(500) NULL AFTER content_text_size',
  'SELECT 1'
);
PREPARE add_youtube_url_column FROM @add_youtube_url_column;
EXECUTE add_youtube_url_column;
DEALLOCATE PREPARE add_youtube_url_column;