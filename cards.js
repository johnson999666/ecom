
const express = require('express');
const router = express.Router();
const requireLogin = require('./login');
const products = require('./products');
const fs = require('fs');



router.get('/cards', requireLogin, (req, res) => {
    fs.readFile('cart.txt', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error reading cart file');
      }
  
      try {
        const productsData = JSON.parse(data);
        const productIds = new Set();
        let totalPrice = 0;
  
        productsData.forEach(product => {
          const productId = product.id;
          if (!productIds.has(productId)) {
            const price = parseFloat(product.price);
            totalPrice += price;
            productIds.add(productId);
          }
        });
  
        res.render('cards', { totalPrice });
      } catch (error) {
        console.error('Error parsing cart data:', error);
        res.status(500).send('Error parsing cart data');
      }
    });
  });

  
  module.exports = router;