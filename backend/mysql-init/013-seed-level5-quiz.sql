USE learn_schema;

-- Seed quiz for Level 5 - Python for Real-World Applications
DELETE q FROM quizzes q
JOIN topics t ON q.topic_id = t.id
WHERE t.title LIKE '%Level 5%Real-World%' OR t.slug LIKE '%Level 5%Real-World%';

INSERT INTO quizzes (topic_id, title, passing_score)
SELECT id, 'Level 5 Quiz — Python for Real-World Applications', 60
FROM topics
WHERE title LIKE '%Level 5%Real-World%' OR slug LIKE '%Level 5%Real-World%'
LIMIT 1;

SET @quiz_id = (SELECT id FROM quizzes WHERE title = 'Level 5 Quiz — Python for Real-World Applications' ORDER BY id DESC LIMIT 1);

-- Q1
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'According to the Python Database API Specification (PEP 249), which object executes SQL queries and fetches data rows?', 1, 0);
SET @q1 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q1, 'Pool', FALSE, 0),
(@q1, 'Connection', FALSE, 1),
(@q1, 'Engine', FALSE, 2),
(@q1, 'Cursor', TRUE, 3);

-- Q2
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'Why should SQL queries use parameterized bindings (%s or ?) instead of string interpolation (f-strings)?', 1, 1);
SET @q2 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q2, 'To reduce memory consumption in the Python runtime', FALSE, 0),
(@q2, 'To protect against SQL Injection attacks and handle parameter escaping safely', TRUE, 1),
(@q2, 'Because f-strings are not supported inside functions', FALSE, 2),
(@q2, 'To force synchronous query execution', FALSE, 3);

-- Q3
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'Which web framework generates interactive OpenAPI/Swagger documentation automatically based on Python type hints?', 1, 2);
SET @q3 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q3, 'Django', FALSE, 0),
(@q3, 'Flask', FALSE, 1),
(@q3, 'FastAPI', TRUE, 2),
(@q3, 'Bottle', FALSE, 3);

-- Q4
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What standard library module provides an object-oriented API for path operations and filesystem traversal?', 1, 3);
SET @q4 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q4, 'os.file', FALSE, 0),
(@q4, 'pathlib', TRUE, 1),
(@q4, 'shutil', FALSE, 2),
(@q4, 'sys.path', FALSE, 3);

-- Q5
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What is the primary benefit of NumPy arrays over standard Python lists for data processing?', 1, 4);
SET @q5 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q5, 'NumPy arrays accept arbitrary mixed types without conversion', FALSE, 0),
(@q5, 'NumPy arrays run vectorized C-level operations on contiguous memory buffers', TRUE, 1),
(@q5, 'NumPy arrays are immutable tuples', FALSE, 2),
(@q5, 'NumPy arrays use no RAM', FALSE, 3);

-- Q6
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'In OpenCV (cv2), what is the default color channel ordering when an image is loaded via cv2.imread()?', 1, 5);
SET @q6 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q6, 'RGB (Red-Green-Blue)', FALSE, 0),
(@q6, 'RGBA (Red-Green-Blue-Alpha)', FALSE, 1),
(@q6, 'BGR (Blue-Green-Red)', TRUE, 2),
(@q6, 'Grayscale', FALSE, 3);

-- Q7
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'In robotics and physical computing, what does PWM (Pulse-Width Modulation) control on actuators like servos and DC motors?', 1, 6);
SET @q7 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q7, 'The baud rate of serial data', FALSE, 0),
(@q7, 'The average voltage or pulse duration by modulating the signal duty cycle', TRUE, 1),
(@q7, 'The network latency between the Pi and microcontrollers', FALSE, 2),
(@q7, 'The image capture frame rate', FALSE, 3);

-- Q8
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'Which hardware communication bus uses two wires labeled SDA (data) and SCL (clock) to connect multiple sensors?', 1, 7);
SET @q8 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q8, 'SPI', FALSE, 0),
(@q8, 'UART', FALSE, 1),
(@q8, 'I2C', TRUE, 2),
(@q8, 'CAN bus', FALSE, 3);

-- Q9
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What logic voltage level is safe to apply directly to Raspberry Pi GPIO header pins?', 1, 8);
SET @q9 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q9, '5.0V', FALSE, 0),
(@q9, '3.3V', TRUE, 1),
(@q9, '12.0V', FALSE, 2),
(@q9, '1.8V only', FALSE, 3);

-- Q10
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What is the fundamental cycle that structures autonomous robotics software architectures?', 1, 9);
SET @q10 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q10, 'Fetch-Decode-Execute', FALSE, 0),
(@q10, 'Sense-Think-Act', TRUE, 1),
(@q10, 'Model-View-Controller', FALSE, 2),
(@q10, 'Request-Response-Cycle', FALSE, 3);
