const express = require('express');
const router = express.Router();
const requireLogin = require('./login');
const products = require('./products');
const fs = require('fs');




router.get('/shopping-cart', requireLogin, (req, res) => {
    // Read the contents of the cart.txt file
    fs.readFile('cart.txt', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error reading cart file');
      }
  
      try {
        // Parse the cart data from the file into an array of objects
        const cartProducts = JSON.parse(data.trim());
  
        // Filter the products based on the product IDs in the cart
        const productIdsInCart = cartProducts.map(item => item.id);
        const productsInCart = products.filter(product => productIdsInCart.includes(product.id));
  
        // Calculate the total price
        const totalPrice = productsInCart.reduce((total, product) => total + product.price, 0);
  
        res.render('shopping-cart', { cart: productsInCart, totalPrice });
      } catch (error) {
        console.error(error);
        res.status(500).send('Error parsing cart data');
      }
    });
  });

  module.exports = router;