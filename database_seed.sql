-- Thrills social app schema + seed data for testing
-- MySQL 8+ compatible

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS activity_log;
DROP VIEW IF EXISTS activities;
DROP TABLE IF EXISTS interests;
DROP TABLE IF EXISTS post_hashtags;
DROP TABLE IF EXISTS hashtags;
DROP TABLE IF EXISTS saved_posts;
DROP TABLE IF EXISTS stories;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS blocked_users;
DROP TABLE IF EXISTS relationships;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(100) DEFAULT NULL,
  website VARCHAR(255) DEFAULT NULL,
  profilePic VARCHAR(255) DEFAULT NULL,
  coverPic VARCHAR(255) DEFAULT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  failedLoginAttempts INT NOT NULL DEFAULT 0,
  lockUntil DATETIME DEFAULT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `desc` TEXT DEFAULT NULL,
  img VARCHAR(255) DEFAULT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  userId INT NOT NULL,
  CONSTRAINT fk_posts_user
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_posts_user_created (userId, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `desc` TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  userId INT NOT NULL,
  postId INT NOT NULL,
  CONSTRAINT fk_comments_user
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_post
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_comments_post_created (postId, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  postId INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_likes_user
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_likes_post
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE KEY uq_likes_user_post (userId, postId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE relationships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  followerUserId INT NOT NULL,
  followedUserId INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_relationships_follower
    FOREIGN KEY (followerUserId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_relationships_followed
    FOREIGN KEY (followedUserId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_relationships_pair (followerUserId, followedUserId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE blocked_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blockerId INT NOT NULL,
  blockedId INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_blocked_users_blocker
    FOREIGN KEY (blockerId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_blocked_users_blocked
    FOREIGN KEY (blockedId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_blocked_users_pair (blockerId, blockedId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user1Id INT NOT NULL,
  user2Id INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_conversations_user1
    FOREIGN KEY (user1Id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_conversations_user2
    FOREIGN KEY (user2Id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_conversations_pair (user1Id, user2Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversationId INT NOT NULL,
  senderId INT NOT NULL,
  text TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  isRead TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_messages_conversation
    FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messages_conversation_created (conversationId, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  senderId INT NOT NULL,
  receiverId INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  postId INT DEFAULT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  isRead TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_notifications_sender
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_receiver
    FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_post
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_notifications_receiver_created (receiverId, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE stories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  img VARCHAR(255) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  userId INT NOT NULL,
  CONSTRAINT fk_stories_user
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_stories_user_created (userId, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE saved_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  postId INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_saved_posts_user
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_posts_post
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE KEY uq_saved_posts_user_post (userId, postId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE hashtags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tag VARCHAR(100) NOT NULL UNIQUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE post_hashtags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postId INT NOT NULL,
  hashtagId INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_post_hashtags_post
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_hashtags_hashtag
    FOREIGN KEY (hashtagId) REFERENCES hashtags(id) ON DELETE CASCADE,
  UNIQUE KEY uq_post_hashtags_pair (postId, hashtagId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE interests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_interests_user
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_interests_user_category (userId, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  postId INT DEFAULT NULL,
  action VARCHAR(50) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_log_user
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_activity_log_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE VIEW activities AS
SELECT id, userId, postId, action AS `action`, createdAt
FROM activity_log;

CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  adminId INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  targetType VARCHAR(50) NOT NULL,
  targetId INT NOT NULL,
  details TEXT DEFAULT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_admin
    FOREIGN KEY (adminId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_audit_logs_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporterId INT NOT NULL,
  targetId INT NOT NULL,
  targetType VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reviewedBy INT DEFAULT NULL,
  reviewedAt DATETIME DEFAULT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_reporter
    FOREIGN KEY (reporterId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_reviewer
    FOREIGN KEY (reviewedBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_reports_status_created (status, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed data
INSERT INTO users (id, username, email, password, name, city, website, profilePic, coverPic, role, createdAt) VALUES
(1, 'alice', 'alice@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Alice Johnson', 'Lagos', 'https://example.com/alice', 'alice.jpg', 'alice-cover.jpg', 'admin', '2026-07-01 09:00:00'),
(2, 'bob', 'bob@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Bob Smith', 'Abuja', 'https://example.com/bob', 'bob.jpg', 'bob-cover.jpg', 'user', '2026-07-01 10:00:00'),
(3, 'carol', 'carol@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Carol White', 'Accra', 'https://example.com/carol', 'carol.jpg', 'carol-cover.jpg', 'user', '2026-07-02 08:30:00'),
(4, 'dave', 'dave@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Dave Brown', 'Nairobi', 'https://example.com/dave', 'dave.jpg', 'dave-cover.jpg', 'user', '2026-07-02 11:15:00');

INSERT INTO refresh_tokens (userId, token, createdAt) VALUES
(1, 'refresh-token-alice', '2026-07-01 09:05:00'),
(2, 'refresh-token-bob', '2026-07-01 10:05:00'),
(3, 'refresh-token-carol', '2026-07-02 08:35:00');

INSERT INTO posts (id, `desc`, img, createdAt, userId) VALUES
(1, 'Enjoying a sunny morning with coffee and code. #travel #coding', 'post1.jpg', '2026-07-03 07:30:00', 1),
(2, 'New project launch in progress. #coding #startup', 'post2.jpg', '2026-07-03 12:00:00', 2),
(3, 'Weekend vibes and a great playlist. #music #weekend', 'post3.jpg', '2026-07-04 18:20:00', 3),
(4, 'Sunset over the city is my favorite view. #travel #sunset', 'post4.jpg', '2026-07-05 20:45:00', 1);

INSERT INTO comments (id, `desc`, createdAt, userId, postId) VALUES
(1, 'Love this view!', '2026-07-03 08:00:00', 2, 1),
(2, 'Coffee and code is the best combo.', '2026-07-03 09:10:00', 3, 1),
(3, 'Excited to see the launch!', '2026-07-03 12:30:00', 1, 2),
(4, 'Perfect playlist for the weekend.', '2026-07-04 18:45:00', 4, 3);

INSERT INTO likes (id, userId, postId, createdAt) VALUES
(1, 2, 1, '2026-07-03 08:05:00'),
(2, 3, 1, '2026-07-03 09:15:00'),
(3, 1, 2, '2026-07-03 12:10:00'),
(4, 4, 3, '2026-07-04 18:50:00');

INSERT INTO relationships (id, followerUserId, followedUserId, createdAt) VALUES
(1, 1, 2, '2026-07-03 08:10:00'),
(2, 1, 3, '2026-07-03 09:20:00'),
(3, 2, 1, '2026-07-03 10:00:00'),
(4, 3, 1, '2026-07-03 11:00:00'),
(5, 4, 2, '2026-07-04 19:00:00');

INSERT INTO blocked_users (id, blockerId, blockedId, createdAt) VALUES
(1, 2, 4, '2026-07-04 19:05:00');

INSERT INTO conversations (id, user1Id, user2Id, createdAt) VALUES
(1, 1, 2, '2026-07-03 08:20:00'),
(2, 2, 3, '2026-07-04 19:10:00');

INSERT INTO messages (id, conversationId, senderId, text, createdAt, isRead) VALUES
(1, 1, 1, 'Hey Bob, are you ready for the meetup?', '2026-07-03 08:25:00', 1),
(2, 1, 2, 'Absolutely, I will bring the demo.', '2026-07-03 08:30:00', 1),
(3, 2, 2, 'Carol, I shared the playlist link.', '2026-07-04 19:15:00', 0);

INSERT INTO notifications (id, senderId, receiverId, type, postId, createdAt, isRead) VALUES
(1, 1, 2, 'follow', NULL, '2026-07-03 08:10:00', 0),
(2, 2, 1, 'like', 1, '2026-07-03 08:05:00', 1),
(3, 3, 1, 'comment', 1, '2026-07-03 09:10:00', 0),
(4, 4, 2, 'message', NULL, '2026-07-04 19:16:00', 0);

INSERT INTO stories (id, img, createdAt, userId) VALUES
(1, 'story-alice.jpg', '2026-07-05 08:00:00', 1),
(2, 'story-bob.jpg', '2026-07-05 12:30:00', 2);

INSERT INTO saved_posts (id, userId, postId, createdAt) VALUES
(1, 1, 2, '2026-07-03 12:20:00'),
(2, 3, 4, '2026-07-05 21:00:00');

INSERT INTO hashtags (id, tag, createdAt) VALUES
(1, 'travel', '2026-07-03 07:31:00'),
(2, 'coding', '2026-07-03 07:32:00'),
(3, 'music', '2026-07-04 18:21:00'),
(4, 'sunset', '2026-07-05 20:46:00');

INSERT INTO post_hashtags (id, postId, hashtagId, createdAt) VALUES
(1, 1, 1, '2026-07-03 07:31:00'),
(2, 1, 2, '2026-07-03 07:32:00'),
(3, 2, 2, '2026-07-03 12:01:00'),
(4, 3, 3, '2026-07-04 18:21:00'),
(5, 4, 1, '2026-07-05 20:46:00'),
(6, 4, 4, '2026-07-05 20:47:00');

INSERT INTO interests (id, userId, category, createdAt) VALUES
(1, 1, 'technology', '2026-07-01 09:10:00'),
(2, 1, 'travel', '2026-07-01 09:11:00'),
(3, 2, 'music', '2026-07-01 10:10:00'),
(4, 3, 'food', '2026-07-02 08:40:00');

INSERT INTO activity_log (id, userId, postId, action, createdAt) VALUES
(1, 1, 1, 'post', '2026-07-03 07:30:00'),
(2, 2, 1, 'like', '2026-07-03 08:05:00'),
(3, 3, 1, 'comment', '2026-07-03 09:10:00'),
(4, 1, 2, 'follow', '2026-07-03 10:00:00');

INSERT INTO audit_logs (id, adminId, action, targetType, targetId, details, createdAt) VALUES
(1, 1, 'login', 'user', 1, 'Admin logged in successfully', '2026-07-03 09:00:00'),
(2, 1, 'resolve_report', 'report', 1, 'Resolved inappropriate content report', '2026-07-04 12:00:00');

INSERT INTO reports (id, reporterId, targetId, targetType, reason, status, reviewedBy, reviewedAt, createdAt) VALUES
(1, 2, 4, 'user', 'Spam behavior', 'resolved', 1, '2026-07-04 12:00:00', '2026-07-04 11:30:00');

-- Expanded seed data for broader testing
INSERT INTO users (id, username, email, password, name, city, website, profilePic, coverPic, role, createdAt) VALUES
(5, 'eva', 'eva@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Eva Martinez', 'Mexico City', 'https://example.com/eva', 'eva.jpg', 'eva-cover.jpg', 'user', '2026-07-06 09:00:00'),
(6, 'frank', 'frank@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Frank Okafor', 'Lagos', 'https://example.com/frank', 'frank.jpg', 'frank-cover.jpg', 'user', '2026-07-06 09:30:00'),
(7, 'grace', 'grace@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Grace Kim', 'Seoul', 'https://example.com/grace', 'grace.jpg', 'grace-cover.jpg', 'user', '2026-07-06 10:15:00'),
(8, 'henry', 'henry@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Henry Patel', 'Mumbai', 'https://example.com/henry', 'henry.jpg', 'henry-cover.jpg', 'user', '2026-07-06 11:00:00'),
(9, 'isla', 'isla@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Isla Nguyen', 'Ho Chi Minh', 'https://example.com/isla', 'isla.jpg', 'isla-cover.jpg', 'user', '2026-07-07 07:20:00'),
(10, 'jack', 'jack@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Jack Mensah', 'Accra', 'https://example.com/jack', 'jack.jpg', 'jack-cover.jpg', 'user', '2026-07-07 08:00:00'),
(11, 'kate', 'kate@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Kate Adebayo', 'Abuja', 'https://example.com/kate', 'kate.jpg', 'kate-cover.jpg', 'user', '2026-07-07 09:10:00'),
(12, 'liam', 'liam@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Liam Rossi', 'Rome', 'https://example.com/liam', 'liam.jpg', 'liam-cover.jpg', 'user', '2026-07-07 10:40:00'),
(13, 'maya', 'maya@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Maya Chen', 'Singapore', 'https://example.com/maya', 'maya.jpg', 'maya-cover.jpg', 'user', '2026-07-08 06:50:00'),
(14, 'noah', 'noah@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Noah Hassan', 'Cairo', 'https://example.com/noah', 'noah.jpg', 'noah-cover.jpg', 'user', '2026-07-08 07:25:00'),
(15, 'olivia', 'olivia@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Olivia Cruz', 'Madrid', 'https://example.com/olivia', 'olivia.jpg', 'olivia-cover.jpg', 'user', '2026-07-08 08:20:00'),
(16, 'peter', 'peter@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Peter Osei', 'Kumasi', 'https://example.com/peter', 'peter.jpg', 'peter-cover.jpg', 'user', '2026-07-08 09:45:00'),
(17, 'quinn', 'quinn@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Quinn Santos', 'Lisbon', 'https://example.com/quinn', 'quinn.jpg', 'quinn-cover.jpg', 'user', '2026-07-09 07:05:00'),
(18, 'ruby', 'ruby@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Ruby Ahmed', 'Dhaka', 'https://example.com/ruby', 'ruby.jpg', 'ruby-cover.jpg', 'user', '2026-07-09 08:30:00'),
(19, 'simon', 'simon@example.com', '$2b$10$.7ReT3EbnHwbcC/v0MRoAubS7qbDmmq.AI3pVycfc0wswza/ZTpne', 'Simon Mwangi', 'Nairobi', 'https://example.com/simon', 'simon.jpg', 'simon-cover.jpg', 'user', '2026-07-09 10:00:00');

INSERT INTO posts (id, `desc`, img, createdAt, userId) VALUES
(5, 'Morning run and fresh pastries. #fitness #morning', 'post5.jpg', '2026-07-06 06:05:00', 5),
(6, 'A long weekend trip with a camera in hand. #travel #photography', 'post6.jpg', '2026-07-06 07:10:00', 6),
(7, 'Building my first side project today. #coding #startup', 'post7.jpg', '2026-07-06 08:15:00', 7),
(8, 'Late-night playlist and coding session. #music #coding', 'post8.jpg', '2026-07-06 09:20:00', 8),
(9, 'Exploring a new neighborhood and trying street food. #travel #food', 'post9.jpg', '2026-07-06 10:30:00', 9),
(10, 'Productive day with a notebook and a coffee. #productivity #coffee', 'post10.jpg', '2026-07-07 06:00:00', 10),
(11, 'A beautiful sunrise from the rooftop. #sunrise #city', 'post11.jpg', '2026-07-07 06:45:00', 11),
(12, 'Weekend game night with great friends. #friends #games', 'post12.jpg', '2026-07-07 07:40:00', 12),
(13, 'Learning UI design and sketching ideas. #design #learning', 'post13.jpg', '2026-07-07 08:20:00', 13),
(14, 'Trying a new recipe and sharing the results. #food #recipe', 'post14.jpg', '2026-07-07 09:05:00', 14),
(15, 'Reading a book and enjoying some quiet time. #books #relax', 'post15.jpg', '2026-07-08 06:10:00', 15),
(16, 'A quick swim and a long walk by the beach. #fitness #beach', 'post16.jpg', '2026-07-08 07:15:00', 16),
(17, 'Bringing a little color into the workspace. #design #workspace', 'post17.jpg', '2026-07-08 08:40:00', 17),
(18, 'Podcast episode recommendations for the week. #podcast #music', 'post18.jpg', '2026-07-08 09:35:00', 18),
(19, 'Fresh flowers on the desk and a clear mind. #morning #wellness', 'post19.jpg', '2026-07-09 06:25:00', 19),
(20, 'A calm evening with a notebook and a lamp. #evening #reading', 'post20.jpg', '2026-07-09 06:50:00', 1),
(21, 'Planning a little getaway for the next holiday. #travel #plans', 'post21.jpg', '2026-07-09 07:30:00', 2),
(22, 'Another great day with some fresh ideas. #creativity #ideas', 'post22.jpg', '2026-07-09 08:10:00', 3),
(23, 'Coffee, music, and a small burst of creativity. #coffee #music', 'post23.jpg', '2026-07-09 09:00:00', 4),
(24, 'A quick update after a fun weekend with friends. #weekend #friends', 'post24.jpg', '2026-07-10 07:00:00', 5),
(25, 'Trying a new workout routine and feeling energized. #fitness #health', 'post25.jpg', '2026-07-10 07:45:00', 6),
(26, 'Sharing a favorite photo from the city lights. #city #photography', 'post26.jpg', '2026-07-10 08:35:00', 7),
(27, 'A productive afternoon with lots of notes. #productivity #learning', 'post27.jpg', '2026-07-10 09:20:00', 8),
(28, 'Enjoying the breeze and a bit of quiet. #relax #nature', 'post28.jpg', '2026-07-11 06:15:00', 9),
(29, 'Building a tiny garden at home. #garden #home', 'post29.jpg', '2026-07-11 07:00:00', 10),
(30, 'A bright room and brighter ideas. #interior #design', 'post30.jpg', '2026-07-11 08:00:00', 11),
(31, 'Team lunch and some thoughtful conversation. #team #food', 'post31.jpg', '2026-07-11 09:15:00', 12),
(32, 'A rainy evening and a warm cup of tea. #rain #tea', 'post32.jpg', '2026-07-12 06:30:00', 13),
(33, 'A mini challenge to stay consistent for a month. #challenge #focus', 'post33.jpg', '2026-07-12 07:20:00', 14),
(34, 'Fresh air and a long walk through the market. #walk #market', 'post34.jpg', '2026-07-12 08:25:00', 15),
(35, 'Experimenting with new tools and a bit of code. #tools #coding', 'post35.jpg', '2026-07-12 09:10:00', 16),
(36, 'Favorite memories from the summer festival. #festival #memories', 'post36.jpg', '2026-07-13 06:40:00', 17),
(37, 'An afternoon of board games and laughter. #games #friends', 'post37.jpg', '2026-07-13 07:30:00', 18),
(38, 'A peaceful morning with some journaling. #journal #morning', 'post38.jpg', '2026-07-13 08:45:00', 19),
(39, 'A tiny desk setup that makes work enjoyable. #workspace #setup', 'post39.jpg', '2026-07-14 06:55:00', 1),
(40, 'Found a new favorite cafe downtown. #cafe #travel', 'post40.jpg', '2026-07-14 07:40:00', 2),
(41, 'A quick reflection on the week so far. #reflection #week', 'post41.jpg', '2026-07-14 08:50:00', 3),
(42, 'A scenic train ride and plenty of good views. #travel #train', 'post42.jpg', '2026-07-15 06:20:00', 4),
(43, 'Preparing for a long trip with a packed bag. #travel #packing', 'post43.jpg', '2026-07-15 07:25:00', 5),
(44, 'An evening of photography and street lights. #photography #city', 'post44.jpg', '2026-07-15 08:10:00', 6),
(45, 'Some quiet time with a good book and tea. #books #tea', 'post45.jpg', '2026-07-16 06:35:00', 7),
(46, 'Working on a side hustle and feeling optimistic. #startup #work', 'post46.jpg', '2026-07-16 07:30:00', 8),
(47, 'Trying a new route for my morning walk. #fitness #walk', 'post47.jpg', '2026-07-16 08:20:00', 9),
(48, 'A simple lunch and a bit of free time. #food #break', 'post48.jpg', '2026-07-17 06:40:00', 10),
(49, 'Experimenting with a new playlist for the day. #music #playlist', 'post49.jpg', '2026-07-17 07:50:00', 11),
(50, 'Watching the clouds roll by and staying calm. #clouds #calm', 'post50.jpg', '2026-07-17 08:35:00', 12),
(51, 'A fresh start and good energy for the day. #motivation #morning', 'post51.jpg', '2026-07-18 06:15:00', 13),
(52, 'Baking something simple and sharing it with friends. #baking #friends', 'post52.jpg', '2026-07-18 07:25:00', 14),
(53, 'Learning a few new tricks in the kitchen. #food #learning', 'post53.jpg', '2026-07-18 08:40:00', 15),
(54, 'A calm night with good company and a little humor. #night #humor', 'post54.jpg', '2026-07-19 06:50:00', 16);

INSERT INTO comments (id, `desc`, createdAt, userId, postId) VALUES
(5, 'Such a lovely morning vibe!', '2026-07-06 06:20:00', 1, 5),
(6, 'Great energy in this post.', '2026-07-06 07:20:00', 2, 6),
(7, 'This sounds like a great plan.', '2026-07-06 08:25:00', 3, 7),
(8, 'Perfect playlist for working late.', '2026-07-06 09:30:00', 4, 8),
(9, 'Street food is the best part of travel.', '2026-07-06 10:40:00', 5, 9),
(10, 'Coffee and notes are a winning combo.', '2026-07-07 06:10:00', 6, 10),
(11, 'The sunrise looks amazing.', '2026-07-07 06:50:00', 7, 11),
(12, 'Game night is always a good idea.', '2026-07-07 07:50:00', 8, 12),
(13, 'Sketches like that always inspire me.', '2026-07-07 08:30:00', 9, 13),
(14, 'That recipe looks delicious.', '2026-07-07 09:10:00', 10, 14),
(15, 'Books and silence are a great combo.', '2026-07-08 06:20:00', 11, 15),
(16, 'Beach days are the best reset.', '2026-07-08 07:25:00', 12, 16),
(17, 'Love the color choice here.', '2026-07-08 08:50:00', 13, 17),
(18, 'Podcast recommendations are always welcome.', '2026-07-08 09:40:00', 14, 18),
(19, 'Fresh flowers really brighten a room.', '2026-07-09 06:35:00', 15, 19),
(20, 'This feels like a very peaceful evening.', '2026-07-09 06:55:00', 16, 20),
(21, 'That getaway sounds exciting.', '2026-07-09 07:40:00', 17, 21),
(22, 'Fresh ideas can be so energizing.', '2026-07-09 08:20:00', 18, 22),
(23, 'Coffee and music are a perfect pair.', '2026-07-09 09:10:00', 19, 23),
(24, 'Weekend friends are the best kind.', '2026-07-10 07:10:00', 1, 24),
(25, 'That routine sounds very doable.', '2026-07-10 07:55:00', 2, 25),
(26, 'The city lights look stunning.', '2026-07-10 08:45:00', 3, 26),
(27, 'Nice to see a productive afternoon.', '2026-07-10 09:25:00', 4, 27),
(28, 'Quiet moments are underrated.', '2026-07-11 06:25:00', 5, 28),
(29, 'A garden at home sounds rewarding.', '2026-07-11 07:10:00', 6, 29),
(30, 'Bright rooms often spark great ideas.', '2026-07-11 08:10:00', 7, 30),
(31, 'Lunch conversations are always memorable.', '2026-07-11 09:25:00', 8, 31),
(32, 'Tea on rainy evenings feels special.', '2026-07-12 06:40:00', 9, 32),
(33, 'Consistency is the real secret.', '2026-07-12 07:30:00', 10, 33),
(34, 'Markets always have the best energy.', '2026-07-12 08:35:00', 11, 34),
(35, 'Tools can make such a difference.', '2026-07-12 09:20:00', 12, 35),
(36, 'Summer festivals leave wonderful memories.', '2026-07-13 06:50:00', 13, 36),
(37, 'Board games and laughter never get old.', '2026-07-13 07:40:00', 14, 37),
(38, 'Journaling can be a great reset.', '2026-07-13 08:55:00', 15, 38),
(39, 'A tidy desk really helps focus.', '2026-07-14 07:05:00', 16, 39),
(40, 'That cafe seems like a great spot.', '2026-07-14 07:50:00', 17, 40),
(41, 'Reflection is so important after a busy week.', '2026-07-14 09:00:00', 18, 41),
(42, 'Train rides always feel cinematic.', '2026-07-15 06:30:00', 19, 42),
(43, 'Packing light is always a challenge.', '2026-07-15 07:35:00', 1, 43),
(44, 'Street lights at night can be magical.', '2026-07-15 08:20:00', 2, 44),
(45, 'Books and tea is a perfect combo.', '2026-07-16 06:45:00', 3, 45),
(46, 'Optimism is contagious.', '2026-07-16 07:40:00', 4, 46),
(47, 'A new route can make a walk feel fresh.', '2026-07-16 08:30:00', 5, 47),
(48, 'Simple lunches are often the best.', '2026-07-17 06:50:00', 6, 48),
(49, 'That playlist idea sounds brilliant.', '2026-07-17 08:00:00', 7, 49),
(50, 'Clouds can be so calming to watch.', '2026-07-17 08:45:00', 8, 50),
(51, 'A fresh start really matters.', '2026-07-18 06:25:00', 9, 51),
(52, 'Baking brings so much joy.', '2026-07-18 07:35:00', 10, 52),
(53, 'Learning tricks in the kitchen is fun.', '2026-07-18 08:50:00', 11, 53),
(54, 'Good company always makes the night better.', '2026-07-19 07:00:00', 12, 54);

INSERT INTO likes (id, userId, postId, createdAt) VALUES
(5, 1, 5, '2026-07-06 06:10:00'),
(6, 2, 5, '2026-07-06 06:15:00'),
(7, 3, 6, '2026-07-06 07:15:00'),
(8, 4, 7, '2026-07-06 08:20:00'),
(9, 5, 8, '2026-07-06 09:25:00'),
(10, 6, 9, '2026-07-06 10:35:00'),
(11, 7, 10, '2026-07-07 06:05:00'),
(12, 8, 11, '2026-07-07 06:50:00'),
(13, 9, 12, '2026-07-07 07:45:00'),
(14, 10, 13, '2026-07-07 08:25:00'),
(15, 11, 14, '2026-07-07 09:10:00'),
(16, 12, 15, '2026-07-08 06:15:00'),
(17, 13, 16, '2026-07-08 07:20:00'),
(18, 14, 17, '2026-07-08 08:45:00'),
(19, 15, 18, '2026-07-08 09:35:00'),
(20, 16, 19, '2026-07-09 06:30:00'),
(21, 17, 20, '2026-07-09 06:55:00'),
(22, 18, 21, '2026-07-09 07:35:00'),
(23, 19, 22, '2026-07-09 08:15:00'),
(24, 1, 23, '2026-07-09 09:05:00'),
(25, 2, 24, '2026-07-10 07:05:00'),
(26, 3, 25, '2026-07-10 07:50:00'),
(27, 4, 26, '2026-07-10 08:40:00'),
(28, 5, 27, '2026-07-10 09:25:00'),
(29, 6, 28, '2026-07-11 06:20:00'),
(30, 7, 29, '2026-07-11 07:05:00'),
(31, 8, 30, '2026-07-11 08:05:00'),
(32, 9, 31, '2026-07-11 09:20:00'),
(33, 10, 32, '2026-07-12 06:35:00'),
(34, 11, 33, '2026-07-12 07:25:00'),
(35, 12, 34, '2026-07-12 08:30:00'),
(36, 13, 35, '2026-07-12 09:15:00'),
(37, 14, 36, '2026-07-13 06:45:00'),
(38, 15, 37, '2026-07-13 07:35:00'),
(39, 16, 38, '2026-07-13 08:50:00'),
(40, 17, 39, '2026-07-14 07:00:00'),
(41, 18, 40, '2026-07-14 07:45:00'),
(42, 19, 41, '2026-07-14 08:55:00'),
(43, 1, 42, '2026-07-15 06:25:00'),
(44, 2, 43, '2026-07-15 07:30:00'),
(45, 3, 44, '2026-07-15 08:15:00'),
(46, 4, 45, '2026-07-16 06:40:00'),
(47, 5, 46, '2026-07-16 07:35:00'),
(48, 6, 47, '2026-07-16 08:25:00'),
(49, 7, 48, '2026-07-17 06:45:00'),
(50, 8, 49, '2026-07-17 07:55:00'),
(51, 9, 50, '2026-07-17 08:40:00'),
(52, 10, 51, '2026-07-18 06:20:00'),
(53, 11, 52, '2026-07-18 07:30:00'),
(54, 12, 53, '2026-07-18 08:45:00'),
(55, 13, 54, '2026-07-19 06:55:00'),
(56, 14, 5, '2026-07-06 06:25:00'),
(57, 15, 6, '2026-07-06 07:25:00'),
(58, 16, 7, '2026-07-06 08:30:00'),
(59, 17, 8, '2026-07-06 09:35:00'),
(60, 18, 9, '2026-07-06 10:45:00'),
(61, 19, 10, '2026-07-07 06:15:00'),
(62, 1, 11, '2026-07-07 06:55:00'),
(63, 2, 12, '2026-07-07 07:55:00'),
(64, 3, 13, '2026-07-07 08:35:00'),
(65, 4, 14, '2026-07-07 09:15:00'),
(66, 5, 15, '2026-07-08 06:25:00'),
(67, 6, 16, '2026-07-08 07:30:00'),
(68, 7, 17, '2026-07-08 08:55:00'),
(69, 8, 18, '2026-07-08 09:45:00'),
(70, 9, 19, '2026-07-09 06:40:00'),
(71, 10, 20, '2026-07-09 07:00:00'),
(72, 11, 21, '2026-07-09 07:45:00'),
(73, 12, 22, '2026-07-09 08:25:00'),
(74, 13, 23, '2026-07-09 09:15:00'),
(75, 14, 24, '2026-07-10 07:15:00');

INSERT INTO relationships (id, followerUserId, followedUserId, createdAt) VALUES
(6, 5, 1, '2026-07-06 06:30:00'),
(7, 6, 1, '2026-07-06 07:35:00'),
(8, 7, 2, '2026-07-06 08:40:00'),
(9, 8, 2, '2026-07-06 09:45:00'),
(10, 9, 3, '2026-07-06 10:50:00'),
(11, 10, 3, '2026-07-07 06:20:00'),
(12, 11, 4, '2026-07-07 07:30:00'),
(13, 12, 4, '2026-07-07 08:40:00'),
(14, 13, 5, '2026-07-07 09:50:00'),
(15, 14, 6, '2026-07-08 06:30:00'),
(16, 15, 7, '2026-07-08 07:35:00'),
(17, 16, 8, '2026-07-08 08:40:00'),
(18, 17, 9, '2026-07-08 09:45:00'),
(19, 18, 10, '2026-07-09 06:40:00'),
(20, 19, 11, '2026-07-09 07:45:00'),
(21, 1, 12, '2026-07-09 08:50:00'),
(22, 2, 13, '2026-07-10 07:20:00'),
(23, 3, 14, '2026-07-10 08:30:00'),
(24, 4, 15, '2026-07-10 09:40:00'),
(25, 5, 16, '2026-07-11 06:35:00'),
(26, 6, 17, '2026-07-11 07:40:00'),
(27, 7, 18, '2026-07-11 08:45:00'),
(28, 8, 19, '2026-07-12 06:50:00'),
(29, 9, 1, '2026-07-12 07:55:00'),
(30, 10, 2, '2026-07-12 09:00:00'),
(31, 11, 3, '2026-07-13 07:05:00'),
(32, 12, 5, '2026-07-13 08:10:00'),
(33, 13, 6, '2026-07-13 09:15:00'),
(34, 14, 7, '2026-07-14 07:20:00'),
(35, 15, 8, '2026-07-14 08:25:00');

INSERT INTO blocked_users (id, blockerId, blockedId, createdAt) VALUES
(2, 3, 19, '2026-07-07 09:00:00'),
(3, 11, 14, '2026-07-11 09:30:00');

INSERT INTO conversations (id, user1Id, user2Id, createdAt) VALUES
(3, 1, 5, '2026-07-06 06:40:00'),
(4, 2, 6, '2026-07-06 07:45:00'),
(5, 3, 7, '2026-07-06 08:50:00'),
(6, 4, 8, '2026-07-06 09:55:00'),
(7, 5, 9, '2026-07-07 06:30:00'),
(8, 6, 10, '2026-07-07 07:35:00');

INSERT INTO messages (id, conversationId, senderId, text, createdAt, isRead) VALUES
(4, 3, 1, 'Hi Eva, I saw your latest post!', '2026-07-06 06:45:00', 1),
(5, 3, 5, 'Thanks! I am glad you liked it.', '2026-07-06 06:50:00', 1),
(6, 4, 2, 'Frank, we should compare notes soon.', '2026-07-06 07:50:00', 1),
(7, 4, 6, 'Absolutely, I would love that.', '2026-07-06 07:55:00', 0),
(8, 5, 3, 'Grace, your project looks amazing.', '2026-07-06 08:55:00', 1),
(9, 5, 7, 'Thanks, I appreciate the support.', '2026-07-06 09:00:00', 0),
(10, 6, 4, 'I enjoyed your latest update.', '2026-07-06 10:00:00', 1),
(11, 6, 8, 'Thank you, I am happy to hear that.', '2026-07-06 10:05:00', 0),
(12, 7, 5, 'Would you like to join a small meetup?', '2026-07-07 06:35:00', 1),
(13, 7, 9, 'Yes, I would love to.', '2026-07-07 06:40:00', 0),
(14, 8, 6, 'I just shared some photos from the trip.', '2026-07-07 07:40:00', 1),
(15, 8, 10, 'That sounds fun, send them over.', '2026-07-07 07:45:00', 0);

INSERT INTO notifications (id, senderId, receiverId, type, postId, createdAt, isRead) VALUES
(5, 5, 1, 'follow', NULL, '2026-07-06 06:30:00', 0),
(6, 6, 1, 'like', 5, '2026-07-06 06:35:00', 1),
(7, 7, 2, 'comment', 6, '2026-07-06 07:40:00', 0),
(8, 8, 2, 'message', NULL, '2026-07-06 09:50:00', 0),
(9, 9, 3, 'follow', NULL, '2026-07-06 10:55:00', 0),
(10, 10, 3, 'like', 7, '2026-07-07 06:25:00', 1),
(11, 11, 4, 'comment', 8, '2026-07-07 07:35:00', 0),
(12, 12, 4, 'follow', NULL, '2026-07-07 08:45:00', 0),
(13, 13, 5, 'like', 9, '2026-07-07 09:55:00', 1),
(14, 14, 6, 'message', NULL, '2026-07-08 06:35:00', 0),
(15, 15, 7, 'follow', NULL, '2026-07-08 07:40:00', 0),
(16, 16, 8, 'comment', 10, '2026-07-08 08:45:00', 1);

INSERT INTO stories (id, img, createdAt, userId) VALUES
(3, 'story-eva.jpg', '2026-07-06 06:40:00', 5),
(4, 'story-frank.jpg', '2026-07-06 07:40:00', 6),
(5, 'story-grace.jpg', '2026-07-06 08:50:00', 7),
(6, 'story-henry.jpg', '2026-07-06 09:55:00', 8),
(7, 'story-isla.jpg', '2026-07-07 06:30:00', 9),
(8, 'story-jack.jpg', '2026-07-07 07:35:00', 10);

INSERT INTO saved_posts (id, userId, postId, createdAt) VALUES
(3, 1, 10, '2026-07-07 06:30:00'),
(4, 2, 11, '2026-07-07 07:35:00'),
(5, 3, 12, '2026-07-07 08:40:00'),
(6, 4, 13, '2026-07-07 09:45:00'),
(7, 5, 14, '2026-07-08 06:40:00'),
(8, 6, 15, '2026-07-08 07:45:00'),
(9, 7, 16, '2026-07-08 08:50:00'),
(10, 8, 17, '2026-07-08 09:55:00'),
(11, 9, 18, '2026-07-09 06:45:00'),
(12, 10, 19, '2026-07-09 07:50:00'),
(13, 11, 20, '2026-07-09 08:55:00'),
(14, 12, 21, '2026-07-10 07:25:00'),
(15, 13, 22, '2026-07-10 08:35:00'),
(16, 14, 23, '2026-07-10 09:45:00');

INSERT INTO hashtags (id, tag, createdAt) VALUES
(5, 'fitness', '2026-07-06 06:05:00'),
(6, 'morning', '2026-07-06 06:06:00'),
(7, 'photography', '2026-07-06 07:11:00'),
(8, 'startup', '2026-07-06 08:16:00'),
(9, 'productivity', '2026-07-07 06:01:00'),
(10, 'coffee', '2026-07-07 06:02:00'),
(11, 'games', '2026-07-07 07:41:00'),
(12, 'design', '2026-07-07 08:21:00'),
(13, 'recipe', '2026-07-07 09:06:00'),
(14, 'books', '2026-07-08 06:11:00'),
(15, 'beach', '2026-07-08 07:16:00'),
(16, 'workspace', '2026-07-08 08:41:00'),
(17, 'podcast', '2026-07-08 09:36:00'),
(18, 'wellness', '2026-07-09 06:26:00'),
(19, 'garden', '2026-07-11 07:01:00'),
(20, 'team', '2026-07-11 09:16:00'),
(21, 'challenge', '2026-07-12 07:21:00'),
(22, 'market', '2026-07-12 08:26:00'),
(23, 'festival', '2026-07-13 06:41:00'),
(24, 'journal', '2026-07-13 08:46:00');

INSERT INTO post_hashtags (id, postId, hashtagId, createdAt) VALUES
(7, 5, 5, '2026-07-06 06:06:00'),
(8, 5, 6, '2026-07-06 06:07:00'),
(9, 6, 7, '2026-07-06 07:12:00'),
(10, 7, 8, '2026-07-06 08:17:00'),
(11, 10, 9, '2026-07-07 06:02:00'),
(12, 10, 10, '2026-07-07 06:03:00'),
(13, 12, 11, '2026-07-07 07:42:00'),
(14, 13, 12, '2026-07-07 08:22:00'),
(15, 14, 13, '2026-07-07 09:07:00'),
(16, 15, 14, '2026-07-08 06:12:00'),
(17, 16, 5, '2026-07-08 07:17:00'),
(18, 16, 15, '2026-07-08 07:18:00'),
(19, 17, 12, '2026-07-08 08:42:00'),
(20, 17, 16, '2026-07-08 08:43:00'),
(21, 18, 17, '2026-07-08 09:37:00'),
(22, 19, 18, '2026-07-09 06:27:00'),
(23, 20, 14, '2026-07-09 06:51:00'),
(24, 21, 7, '2026-07-09 07:31:00'),
(25, 22, 12, '2026-07-09 08:11:00'),
(26, 23, 10, '2026-07-09 09:01:00'),
(27, 24, 11, '2026-07-10 07:01:00'),
(28, 25, 5, '2026-07-10 07:46:00'),
(29, 26, 7, '2026-07-10 08:36:00'),
(30, 27, 9, '2026-07-10 09:21:00'),
(31, 28, 14, '2026-07-11 06:16:00'),
(32, 29, 19, '2026-07-11 07:02:00'),
(33, 30, 12, '2026-07-11 08:01:00'),
(34, 31, 20, '2026-07-11 09:17:00'),
(35, 32, 6, '2026-07-12 06:31:00'),
(36, 33, 21, '2026-07-12 07:22:00'),
(37, 34, 22, '2026-07-12 08:27:00'),
(38, 35, 8, '2026-07-12 09:11:00'),
(39, 36, 23, '2026-07-13 06:42:00'),
(40, 37, 11, '2026-07-13 07:31:00'),
(41, 38, 24, '2026-07-13 08:47:00'),
(42, 39, 16, '2026-07-14 06:56:00'),
(43, 40, 7, '2026-07-14 07:41:00'),
(44, 41, 6, '2026-07-14 08:51:00'),
(45, 42, 7, '2026-07-15 06:21:00'),
(46, 43, 7, '2026-07-15 07:26:00'),
(47, 44, 7, '2026-07-15 08:11:00'),
(48, 45, 14, '2026-07-16 06:36:00'),
(49, 46, 8, '2026-07-16 07:31:00'),
(50, 47, 5, '2026-07-16 08:21:00'),
(51, 48, 13, '2026-07-17 06:41:00'),
(52, 49, 10, '2026-07-17 07:51:00'),
(53, 50, 6, '2026-07-17 08:36:00'),
(54, 51, 6, '2026-07-18 06:16:00'),
(55, 52, 13, '2026-07-18 07:26:00'),
(56, 53, 12, '2026-07-18 08:41:00'),
(57, 54, 11, '2026-07-19 06:51:00');

INSERT INTO interests (id, userId, category, createdAt) VALUES
(5, 5, 'fitness', '2026-07-06 06:10:00'),
(6, 6, 'travel', '2026-07-06 07:10:00'),
(7, 7, 'startups', '2026-07-06 08:10:00'),
(8, 8, 'music', '2026-07-06 09:10:00'),
(9, 9, 'food', '2026-07-06 10:10:00'),
(10, 10, 'productivity', '2026-07-07 06:10:00'),
(11, 11, 'photography', '2026-07-07 07:10:00'),
(12, 12, 'gaming', '2026-07-07 08:10:00'),
(13, 13, 'design', '2026-07-07 09:10:00'),
(14, 14, 'cooking', '2026-07-07 10:10:00'),
(15, 15, 'reading', '2026-07-08 06:10:00'),
(16, 16, 'fitness', '2026-07-08 07:10:00'),
(17, 17, 'design', '2026-07-08 08:10:00'),
(18, 18, 'podcasts', '2026-07-08 09:10:00'),
(19, 19, 'wellness', '2026-07-09 06:10:00'),
(20, 1, 'books', '2026-07-09 07:10:00');

INSERT INTO activity_log (id, userId, postId, action, createdAt) VALUES
(5, 5, 5, 'post', '2026-07-06 06:05:00'),
(6, 6, 6, 'post', '2026-07-06 07:10:00'),
(7, 7, 7, 'post', '2026-07-06 08:15:00'),
(8, 8, 8, 'post', '2026-07-06 09:20:00'),
(9, 9, 9, 'post', '2026-07-06 10:30:00'),
(10, 10, 10, 'post', '2026-07-07 06:00:00'),
(11, 11, 11, 'post', '2026-07-07 06:45:00'),
(12, 12, 12, 'post', '2026-07-07 07:40:00'),
(13, 13, 13, 'post', '2026-07-07 08:20:00'),
(14, 14, 14, 'post', '2026-07-07 09:05:00'),
(15, 15, 15, 'post', '2026-07-08 06:10:00'),
(16, 16, 16, 'post', '2026-07-08 07:15:00'),
(17, 17, 17, 'post', '2026-07-08 08:40:00'),
(18, 18, 18, 'post', '2026-07-08 09:35:00'),
(19, 19, 19, 'post', '2026-07-09 06:25:00'),
(20, 1, 20, 'post', '2026-07-09 06:50:00');

INSERT INTO audit_logs (id, adminId, action, targetType, targetId, details, createdAt) VALUES
(3, 1, 'ban_user', 'user', 14, 'Temporary ban applied for violating rules', '2026-07-08 10:00:00'),
(4, 1, 'delete_post', 'post', 20, 'Deleted a post due to policy issues', '2026-07-09 09:00:00'),
(5, 1, 'approve_report', 'report', 1, 'Approved the report review', '2026-07-10 12:00:00');

INSERT INTO reports (id, reporterId, targetId, targetType, reason, status, reviewedBy, reviewedAt, createdAt) VALUES
(2, 5, 12, 'user', 'Inappropriate content', 'pending', NULL, NULL, '2026-07-06 10:00:00'),
(3, 8, 16, 'post', 'Repeated spam behavior', 'pending', NULL, NULL, '2026-07-08 08:40:00');
