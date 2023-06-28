const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const products = require('./products');
const deleteItem = require('./delete-item');
const cardsRouter = require('./cards');
const cartRouter = require('./cart');
const signUpRouter = require('./sign-up');
const addToCartRouter = require('./add-to-cart');
const shoppingCart = require('./shopping-cart');
const loginRouter = require('./login');

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

app.use('/add-to-cart', addToCartRouter);
app.use('/', loginRouter);
app.use('/', deleteItem);
app.use('/', shoppingCart);
app.use('/', cardsRouter);
app.use('/', cartRouter);
app.use('/', signUpRouter);

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

  // Calculate the next and previous page numbers
  const nextPage = (products.length === productsPerPage) ? pageNumber + 1 : null;
  const previousPage = (pageNumber > 1) ? pageNumber - 1 : null;

  res.render('index', { products, cart, pageNumber, nextPage, previousPage }); // Pass variables to the template
});

app.get('/thank-you', (req, res) => {
  const cart = req.session.cart || [];
  res.render('thank-you', { cart });
});

app.get('/store', (req, res) => {
  const cart = req.session.cart || [];
  res.render('store', { products, cart });
});

app.get('/product-details/:productId', requireLogin, (req, res) => {
  const productId = req.params.productId;
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).send('Product not found');
  }
  
  res.render('product-details', { product, products }); // Pass the `products` array to the template
});



// Start the server
const port = process.env.PORT || 3000;
const host = '0.0.0.0';
app.listen(port, host, () => {
  console.log(`Server listening on port ${port}`);
});
