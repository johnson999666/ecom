const express = require('express');
const router = express.Router();
const products = require('./products');
const fs = require('fs');




router.get('/add-to-cart/:id', (req, res) => {
    const productId = req.params.id;
  
    // Check if the provided product ID is valid
    if (productId >= 1 && productId <= products.length) {
      const product = products[productId - 1];
  
      if (!req.session.cart) {
        req.session.cart = [];
      }
  
      req.session.cart.push(product);
  
      // Read the contents of the cart.txt file
      fs.readFile('cart.txt', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error reading cart file');
        } else {
          // Split the data into an array of cart items (JSON strings)
          const cartItems = data.split('\n').filter(Boolean);
  
          // Parse each cart item (JSON string) into an object
          const cartProducts = cartItems.map(item => JSON.parse(item));
  
          res.render('cart', { cart: cartProducts });
        }
      });
    } else {
      res.status(404).send('Product not found');
    }
  });

  module.exports = router;