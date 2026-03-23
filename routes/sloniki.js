import express from 'express';
import bcrypt from 'bcrypt';
const router = express.Router();
import db from '../db/connector.js';

router.get('/', async function(req, res, next) {
  const sloniki = await db.query('SELECT * FROM sloniki');
  const rowSloniki = sloniki.rows.map(s => {
    return {
      ...s,
      created_at_time: s.created_at.toLocaleTimeString(), 
      created_at_date: s.created_at.toLocaleDateString()
    }
  })

  res.render('sloniki', { sloniki: rowSloniki || [] });
});

router.get('/create', async function(req, res, next) {
  res.render('forms/sloniki_form');
})

const SALT_ROUNDS = 10

router.post('/create', async function(req, res, next) {
  console.log("Submitted data: ", req.body);


const { username, password, age, place_of_birth } = req.body;

async function registerSlonik(username, password, age, place_of_birth) {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const query = `
    INSERT INTO sloniki (
          username, password_hash, age, place_of_birth
      )
      VALUES ($1, $2, $3, $4) 
      RETURNING *`;
  const res = await db.query(query, [username, hash, age, place_of_birth]);
  
  console.log(`✓ Slonik registered successfully: @${res.rows[0].username}`);
  console.log('✓ Password hash stored securely.');
  } catch (err) 
    { console.error(err)
      throw err;
    // console.error(`!! Error registering slonik: this slonik: @${username} is already exist`);
  }
}

try {
    await registerSlonik(username, password, age, place_of_birth);
    
    res.redirect('/sloniki');
  } catch (err) {
    res.status(500).send(`!! Error registering slonik: this slonik: @${username} is already exist`);
  }
});







router.get('/delete', async function(req, res, next) {
  res.render('forms/deleteSloniki');
})

router.post('/delete', async function(req, res, next) {
  console.log("Deleted data: ", req.body);
  
const { username, password} = req.body;

async function deleteSlonik(username, password) {
   try {
      const res = await db.query('SELECT * FROM sloniki WHERE username = $1', [username]);
      if (res.rows.length === 0) {
         console.log('??? No slonik found with that username.');
         return;
      }
      const slonik = res.rows[0];
      const isMatch = await bcrypt.compare(password, slonik.password_hash);
      if (isMatch) {
         await db.query('DELETE FROM sloniki WHERE username = $1', [username]);
         console.log(`✓  The slonik @${username} has been removed from the database..`);
      } else {
         res.status(403).send('Невірний пароль');
    }
   } catch (err) {
      res.status(500).send(`Error during deleting`);
   }
}


try {
    await deleteSlonik(username, password);
    
    res.redirect('/sloniki');
  } catch (err) {
    res.status(500).send(`!! Error deleting slonik: @${username}`);
  }
});



export default router;