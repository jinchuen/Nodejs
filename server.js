const express = require('express');
const app = express();
const bcrypt = require('bcrypt');

app.use(express.json());

const users = [];

app.get('/users', (req, res) => {
  res.send(users);
});

app.post('/users', async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const user = { name: req.body.name, password: hashedPassword };
  users.push(user);
  res.status(201).send();
});

app.post('/login', async (req, res) => {
    const user = users.find(user => user.name === req.body.name)
    if(user == null)
        return res.status(400).send('User not found');
    try {
        if(await bcrypt.compare(req.body.password, user.password)) {
            res.send('Login successful');
        } else {
            res.status(400).send('Invalid password');
        }
    } catch {
        res.status(500).send();
    }
})

app.listen(3000);
