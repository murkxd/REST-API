CREATE DATABASE  wa_api;

USE wa_api;

CREATE TABLE  posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    allowed_viewers TEXT 
);


CREATE TABLE  users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user' 
);

INSERT INTO posts (content, author, allowed_viewers)
VALUES 
    ('Welcome to our blog! This is the first post, where we introduce our platform.', 'admin', NULL),
    ('Today, we are excited to share some updates on our website. Stay tuned for more!', 'admin', NULL),
    ('Check out our new features, including the option to connect with other users.', 'alice', 'admin,user,user2'),
    ('Here’s a quick tutorial on getting started with our platform. Let us know what you think!', 'bob', 'user'),
    ('We’re open to suggestions! Feel free to leave your feedback in the comments.', 'admin', NULL),
    ('A quick look at the recent updates. Don’t miss out!', 'charlie', NULL);