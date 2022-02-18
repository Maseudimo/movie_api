// Load express framework
const express = require('express');
const app = express();

// Import Morgan middleware library
const morgan = require('morgan');

// Log basic request data in terminal using Morgan middleware library
app.use(morgan('common'));

// Create array of objects that holds top movies
let topMovies = [
  {
    name: 'Movie 1',
    director: 'Director 1'
  },
  {
    name: 'Movie 2',
    director: 'Director 2'
  },
  {
    name: 'Movie 3',
    director: 'Director 3'
  }
];

// GET topMovies JSON for '/movies' request URL
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// GET Welcome message for '/' request URL
app.get('/', (req, res) => {
  res.send('Welcome to the myMovies App!');
});

// Serve static content for the app from the 'public' directory
app.use(express.static('public'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Listen to port 8080
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
