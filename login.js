
const express = require('express');
const router = express.Router();
const fs = require('fs');


router.get('/login', (req, res) => {
    res.render('login');
  });
  
  router.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Read the content of the text file
    fs.readFile('user-data.txt', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.redirect('/login');
        return;
      }
  
      try {
        // Parse the JSON data from the file
        const userData = JSON.parse(data);
  
        // Check if the login credentials match
        if (username === userData.username && password === userData.password) {
          req.session.username = username;
          if (req.session.redirectTo) {
            const redirectTo = req.session.redirectTo;
            delete req.session.redirectTo;
            res.redirect(redirectTo);
  
          } else {
            res.redirect('/');
          }
        } else {
          res.redirect('/login');
        }
      } catch (err) {
        console.error(err);
        res.redirect('/login');
      }
    });
  });

  module.exports = router;