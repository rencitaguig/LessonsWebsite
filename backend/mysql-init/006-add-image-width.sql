USE learn_schema;

SET @image_width_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'topic_images'
    AND COLUMN_NAME = 'image_width'
);

SET @add_image_width_column = IF(
  @image_width_column_exists = 0,
  'ALTER TABLE topic_images ADD COLUMN image_width TINYINT UNSIGNED NOT NULL DEFAULT 100 AFTER image_position',
  'SELECT 1'
);
PREPARE add_image_width_column FROM @add_image_width_column;
EXECUTE add_image_width_column;
DEALLOCATE PREPARE add_image_width_column;