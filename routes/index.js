import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

router.get('/', async function(req, res, next) {
  const students = await db.query('SELECT * FROM users');

  res.render('index', { students: students.rows || [] });
});

export default router;
