const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../')));
app.use(express.static(path.join(__dirname, '../../sing_page')));
app.use(express.static(path.join(__dirname, '../../theory_page')));
app.use(express.static(path.join(__dirname, '../../theory_page/img')));
app.use(express.static(path.join(__dirname, '../../theory_page/topics')));
app.use(express.static(path.join(__dirname, '../../tests_page')));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../../sing_page/login.html'));
});
app.get('/topic', (req, res) => {
  res.sendFile(path.join(__dirname, '../../theory_page/topics/five.html'));
});

app.get(
  '/register',
  (req, res) => { res.sendFile(path.join(__dirname, '../registration.html')); });

app.get('/theory', (req, res) => {
  res.sendFile(path.join(__dirname, '../../theory_page/theory.html'));
});

app.get('/test', (req, res) => {
  const testId = req.query.testId;
  if (testId) {
    res.sendFile(path.join(__dirname, '../../tests_page/ex_questions.html'));

  } else {
    res.send('Параметр testId отсутствует');
  }
});

app.get('/questions', (req, res) => {
  fs.readFile(path.join(__dirname, '../../tests_page/questions.json'), 'utf8',
    (err, data) => {
      if (err) {
        return res.status(500).send('Ошибка при загрузке вопросов');
      }
      const questions = JSON.parse(data);
      res.json(questions);
    });
});

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'school'
});

db.connect(err => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
    return;
  }
  console.log('Подключено к базе данных');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../sing_page/login.html'));
});

app.post('/login', (req, res) => {
  const { status, login, password } = req.body;

  let table;
  if (status === 'student')
    table = 'students';
  else if (status === 'teacher')
    table = 'teachers';
  else if (status === 'admin')
    table = 'admins';

  const sql = `SELECT status, login, password FROM ${table} WHERE login = ? AND password = ?`;

  db.query(sql, [login, password], (err, results) => {
    if (err) {
      console.error('Ошибка при проверке данных:', err);
      return res.status(500).send('Ошибка при проверке данных');
    }

    if (results.length > 0) {
      res.send('Вход успешен');
    } else {
      res.status(401).send('Неверный логин или пароль');
    }
  });
});

app.post('/register', (req, res) => {
  const { fio, class_num, letter, login, password, code, status } = req.body;

  let table;
  if (code === '123' && status === 'student') {
    table = 'students';
  } else if (code === '456' && status === 'teacher') {
    table = 'teachers';
  } else if (code === '789' && status === 'admin') {
    table = 'admins';
  } else {
    return res.status(400).send('Неверный код идентификации');
  }

  const sql = `INSERT INTO ${table} (fio, class_num, letter, login, password, status) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [fio, class_num, letter, login, password, status],
    (err, result) => {
      if (err) {
        console.error('Ошибка при добавлении в базу данных:', err);
        return res.status(500).send(
          'Ошибка при добавлении в базу данных');
      }
      res.send('Регистрация успешна');
    });
});

app.listen(
  port, () => { console.log(`Сервер запущен на http://localhost:${port}`); });