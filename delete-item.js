const express = require('express');
const router = express.Router();
const products = require('./products');
const fs = require('fs');



router.post('/delete-item', (req, res) => {
    const { productId } = req.body;
  
    fs.readFile('cart.txt', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading cart file:', err);
        return res.status(500).send('Error reading cart file');
      }
  
      try {
        // Parse the cart data from the file into an array of objects
        let cartProducts = JSON.parse(data.trim());
  
        // Filter out the product with the matching productId
        cartProducts = cartProducts.filter((product) => product.id !== productId);
  
        // Convert the updated cart products back to JSON string
        const updatedCartData = JSON.stringify(cartProducts);
  
        // Write the updated cart data to the file
        fs.writeFile('cart.txt', updatedCartData, (err) => {
          if (err) {
            console.error('Error updating cart file:', err);
            return res.status(500).send('Error updating cart file');
          }
  
          console.log('Item deleted from cart:', productId);
          
        });
      } catch (error) {
        console.error('Error parsing cart data:', error);
        res.status(500).send('Error parsing cart data');
      }
    });
  });



  module.exports = router;