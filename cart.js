const express = require('express');
const router = express.Router();
const requireLogin = require('./login');
const products = require('./products');
const fs = require('fs');


router.get('/cart', requireLogin, (req, res) => {
    const productId = req.query.productId;
    const product = products.find((p) => p.id === productId);
  
    if (!product) {
      return res.status(404).send('Product not found');
    }
  
    fs.readFile('cart.txt', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error reading cart file');
      }
  
      let cartItems = [];
      if (data) {
        try {
          cartItems = JSON.parse(data);
        } catch (error) {
          console.error('Error parsing cart data:', error);
          return res.status(500).send('Error parsing cart data');
        }
      }
  
      cartItems.push(product);
  
      const cartData = JSON.stringify(cartItems, null, 2); // Convert the updated cart items to a formatted JSON string
  
      fs.writeFile('cart.txt', cartData, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error writing to cart file');
        }
  
        console.log('Cart data added to cart.txt');
        
      });
    });
  });
  

  
  module.exports = router;