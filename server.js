const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

app.use(express.json());

const users = [];
let refreshTokens = [];

app.get('/users', authenticateToken, (req, res) => {
  res.send(users.filter(user => user.name === req.user.name));
});

app.post('/token', (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken });
  });
});

app.post('/users', async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const user = { name: req.body.name, password: hashedPassword };
  users.push(user);
  res.status(201).send();
});

app.post('/login', async (req, res) => {
  const user = users.find(u => u.name === req.body.name);
  if (!user) return res.status(400).send('User not found');

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = generateAccessToken(user);
      const refreshToken = jwt.sign({ name: user.name }, process.env.REFRESH_TOKEN_SECRET);
      refreshTokens.push(refreshToken); // 🔥 Store refresh token
      res.json({ accessToken, refreshToken });
    } else {
      res.status(400).send('Invalid password');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error", details: error.message });
  }
});

app.post('/logout', (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.sendStatus(400); // No token provided

  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  res.sendStatus(204); // No content, success
});


function generateAccessToken(user) {
  return jwt.sign({ name: user.name }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(3000, () => console.log("Server running on port 3000"));
