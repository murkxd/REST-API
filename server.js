console.log("starting server");
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());

console.log("server started");
app.use(express.static(path.join(__dirname, "public")));

const JWT_SECRET = "0Wg11ndyhI+WpHVYSCT6jxrcC2OPabIcMf/4A8Ip7ug=";

const db = mysql.createConnection({
  host: "http://3.88.2.83:3050",
  user: "root",
  password: "",
  database: "wa_api",
});

db.connect((err) => {
  console.log("Connected to MySQL Database!");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(sql, [username, hashedPassword], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).send({ message: "User registered" });
  });
});

db.query("SELECT * FROM users", async (err, result) => {
  console.log(result);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async (err, result) => {
    if (err || result.length === 0)
      return res.status(401).send({ message: "Invalid credentials" });

    const user = result[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).send({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.send({ message: "Logged in successfully", token });
  });
});

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send({ message: "No token provided" });

  jwt.verify(token.split(" ")[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

app.get("/api/protected", verifyToken, (req, res) => {
  res.send({
    message: `Welcome, ${req.user.username}. You are authenticated!`,
  });
});

app.post("/blog", verifyToken, (req, res) => {
  const { content, author } = req.body;
  const date = new Date();
  const sql =
    "INSERT INTO posts (content, author, created_at) VALUES (?, ?, ?)";
  db.query(sql, [content, author, date], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).send({ id: result.insertId });
  });
});

app.get("/blog", verifyToken, (req, res) => {
  const sql = "SELECT * FROM posts";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

app.get("/blog/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM posts WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0)
      return res.status(404).send({ error: "Post not found" });
    res.send(result[0]);
  });
});

app.delete("/blog/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM posts WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0)
      return res.status(404).send({ error: "Post not found" });
    res.send({ message: "Post deleted" });
  });
});

app.patch("/blog/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const fields = [];
  const values = [];
  for (let [key, value] of Object.entries(req.body)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  const sql = `UPDATE posts SET ${fields.join(", ")} WHERE id = ?`;
  values.push(id);
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0)
      return res.status(404).send({ error: "Post not found" });
    res.send({ message: "Post updated" });
  });
});

app.get("/api/about", (req, res) => {
  res.json({
    description: "This is a REST API for a blog application.",
    endpoints: [
      {
        method: "POST",
        path: "/register",
        description: "Registers a new user.",
        requestBody: { username: "string", password: "string" },
        authorization: "None",
      },
      {
        method: "POST",
        path: "/login",
        description: "Logs in a user and returns a JWT token.",
        requestBody: { username: "string", password: "string" },
        authorization: "None",
      },
      {
        method: "POST",
        path: "/blog",
        description: "Creates a new blog post.",
        requestBody: { content: "string", author: "string" },
        authorization: "JWT token",
      },
      {
        method: "GET",
        path: "/blog",
        description: "Fetches all blog posts.",
        authorization: "JWT token",
      },
      {
        method: "GET",
        path: "/blog/:id",
        description: "Fetches a blog post by ID.",
        authorization: "JWT token",
      },
      {
        method: "DELETE",
        path: "/blog/:id",
        description: "Deletes a blog post by ID.",
        authorization: "JWT token",
      },
      {
        method: "PATCH",
        path: "/blog/:id",
        description: "Updates a blog post by ID.",
        requestBody: { key: "value" },
        authorization: "JWT token",
      },
    ],
  });
});

app.listen(3050, "0.0.0.0", () => {
  console.log("Website and API are running on http://3.88.2.83:3050");
});
