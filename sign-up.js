
const express = require('express');
const router = express.Router();


const fs = require('fs');


router.get('/sign-up', (req, res) => {
    res.render('sign-up');
  });
  
router.post('/signup', (req, res) => {
    const { username, password } = req.body;
  
    // Create a JSON object with the username and password
    const user = {
      username,
      password
    };
  
    // Convert the user object to JSON
    const jsonData = JSON.stringify(user);
  
    // Save the JSON data to a text file
    fs.writeFile('user-data.txt', jsonData, (err) => {
      if (err) {
        console.error(err);
        res.redirect('/');
      } else {
        res.redirect('/');
      }
    });
  });

  module.exports = router;