USE learn_schema;

SET @image_position_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'topics'
    AND COLUMN_NAME = 'image_position'
);

SET @add_image_position_column = IF(
  @image_position_column_exists = 0,
  "ALTER TABLE topics ADD COLUMN image_position ENUM('top', 'bottom', 'left', 'right') NOT NULL DEFAULT 'top' AFTER image_url",
  'SELECT 1'
);
PREPARE add_image_position_column FROM @add_image_position_column;
EXECUTE add_image_position_column;
DEALLOCATE PREPARE add_image_position_column;