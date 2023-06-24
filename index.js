const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const fs = require('fs');
const crypto = require('crypto');
const app = express();


// Set up middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// Sample product data
const products = [
  {
    id: '1',
    name: 'Product 1',
    price: 19.99,
    description: 'This is the first product',
    image: 'images/green.jpg',
  },
  {
    id: '2',
    name: 'Product 2',
    price: 29.99,
    description: 'This is the second product',
    image: 'images/red.jpg',
  },
  {
    id: '3',
    name: 'Product 3',
    price: 39.99,
    description: 'This is the third product',
    image: 'images/green.jpg',
  },
  {
    id: '4',
    name: 'Product 4',
    price: 3.99,
    description: 'This is the third product',
    image: 'images/light-green.jpg',
  },
  {
    id: '5',
    name: 'Product 5',
    price: 39.99,
    description: 'This is the third product',
    image: 'images/yellow.jpg',
  },
  {
    id: '5',
    name: 'Product 6',
    price: 9.99,
    description: 'This is the third product',
    image: 'images/orange.jpg',
  },
  {
    id: '6',
    name: 'Product 7',
    price: 9.99,
    description: 'This is the third product',
    image: 'images/whit.jpg',
  },
  {
    id: '8',
    name: 'Product 8',
    price: 9.99,
    description: 'This is the third product',
    image: 'images/blu.jpg',
  },
  {
    id: '9',
    name: 'Product 9',
    price: 9.99,
    description: 'This is the third product',
    image: 'images/perp.jpg',
  },
  {
    id: '10',
    name: 'Product 10',
    price: 9.99,
    description: 'This is the third product',
    image: 'images/pin.jpg',
  },
  {
    id: '11',
    name: 'Product 11',
    price: 9.99,
    description: 'This is the third product',
    image: 'images/yell.jpg',
  },
  {
    id: '12',
    name: 'Product 12',
    price: 9.99,
    description: 'This is the third product',
    image: 'images/gr.jpg',
  },
  {
    id: '13',
    name: 'Product 13',
    price: 9.99,
    description: 'This is the third product',
    image: 'images/coat1.jpg',
  },
  {
    id: '14',
    name: 'Product 14',
    price: 9.99,
    description: 'This is the third product',
    image: 'images/coat2.jpg',
  },
  {
    id: '15',
    name: 'Product 15',
    price: 9.99,
    description: 'This is the third product',
    image: 'images/coat4.jpg',
  },
  {
    id: '16',
    name: 'Product 16',
    price: 9.99,
    description: 'This is the third product',
    image: 'images/coat5.jpg',
  },
  {
    id: '17',
    name: 'Product 17',
    price: 9.99,
    description: 'This is the third product',
    image: 'images/coat6.jpg',
  },
];


const requireLogin = (req, res, next) => {
  if (!req.session.username) {
    req.session.redirectTo = req.originalUrl;
    res.redirect('/login');
    return;
  }
  next();
};






// Generate a random secret key
const generateSecretKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Use the generated secret key for the session
app.use(session({
  secret: generateSecretKey(),
  resave: false,
  saveUninitialized: false
}));




// Connect to MongoDB
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://jamesmleppo:Raylewis@cluster0.yhm4odr.mongodb.net/mydatabase?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Define the schema and model
const dataSchema = new mongoose.Schema({
  username: String,
  password: String,
  cardNumber: String,
  cvv: String,
  expirationDate: String,
  productId: String
});

const Data = mongoose.model('Data', dataSchema);

app.post('/buy-all', async (req, res) => {
  try {
    const { username, password, cardNumber, cvv, expirationDate } = req.body;

    // Read the contents of cart.txt and user-data.txt
    const cartData = await fs.promises.readFile('cart.txt', 'utf8');
    const userData = await fs.promises.readFile('user-data.txt', 'utf8');

    // Parse the JSON data from cart.txt and user-data.txt
    const cartItems = JSON.parse(cartData);
    const user = JSON.parse(userData);

    // Extract the IDs from cartItems
    const productIds = cartItems.map(item => item.id);

    // Create a new document and save it to MongoDB
    const dataDocument = new Data({
      username: user.username || username,
      password: user.password || password,
      cardNumber,
      cvv,
      expirationDate,
      productId: productIds.join(', ')
    });
    await dataDocument.save();
    console.log('Data saved to MongoDB');

    // Clear the contents of cart.txt
    await fs.promises.writeFile('cart.txt', '');
    console.log('Cart file cleared');

    res.redirect('/thank-you');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

// ...




function fetchProducts(startIndex, endIndex) {
  // Slice the products array based on the specified range
  return products.slice(startIndex, endIndex);
}

app.get('/', requireLogin, (req, res) => {
  const cart = req.session.cart || [];
  const productsPerPage = 6; // Number of products per page
  const pageNumber = parseInt(req.query.page) || 1; // Get the current page number from the query parameter
  const startIndex = (pageNumber - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;

  const products = fetchProducts(startIndex, endIndex); // Retrieve products based on the range

  // Calculate the next page number
  const nextPage = (products.length === productsPerPage) ? pageNumber + 1 : null;

  res.render('index', { products, cart, pageNumber, nextPage }); // Pass products array as a variable to the template
});







app.get('/product/:id', requireLogin, (req, res) => {
  let productId = req.params.id;

  if (!productId) {
    // If no ID is provided, set it to 1
    productId = '1';
  } else {
    // Increment the provided ID by 1
    productId = String(parseInt(productId, 10) + 1);
  }

  // Check if the provided product ID is valid
  const product = products.find((p) => p.id === productId);

  if (product) {
    res.render('product', { product });
  } else {
    res.status(404).send('Product not found');
  }
});

app.get('/add-to-cart/:id', requireLogin, (req, res) => {
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


app.get('/cards', requireLogin, (req, res) => {
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



app.get('/product-details/:productId', requireLogin, (req, res) => {
  const productId = req.params.productId;
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).send('Product not found');
  }
  
  res.render('product-details', { product });
});


app.get('/thank-you', (req, res) => {
  const cart = req.session.cart || [];
  res.render('thank-you', { cart });
});

// GET endpoint to refresh the shopping cart page
app.get('/refresh', (req, res) => {
  // Assuming you have the cart items and totalPrice available

  // Render the shopping cart EJS template and pass the cart and totalPrice as variables
  res.render('shopping-cart.ejs', { cart, totalPrice });
});



app.get('/cart', requireLogin, (req, res) => {
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





app.get('/shopping-cart', requireLogin, (req, res) => {
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

app.post('/delete-item', (req, res) => {
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

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Read the content of the text file
  fs.readFile('user-data.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
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
        res.status(401).send('Incorrect login credentials');
      }
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });
});

app.get('/', requireLogin, (req, res) => {
  const cart = req.session.cart || [];
  res.render('index', { products, cart });
});






app.get('/sign-up', (req, res) => {
  res.render('sign-up');
});

app.post('/signup', (req, res) => {
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
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

app.get('/store', (req, res) => {
  const cart = req.session.cart || [];
  res.render('store', { products, cart });
});

// Start the server
const port = process.env.PORT || 3000;
const host = '0.0.0.0';
app.listen(port, host, () => {
  console.log(`Server listening on port ${port}`);
});

