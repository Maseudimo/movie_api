// Load express framework
const express = require('express');
const app = express();

// Importing middleware libraries: Morgan, body-parser, and uuid
const morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

// Use body-parser middleware function
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import Mongoose, models.js and respective models
const mongoose = require('mongoose');
Models = require('./models.js');
Movies = Models.Movie;
Users = Models.User;

// Import and use CORS, set allowed origins
const cors = require('cors');

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'https://mehos-myflix-app.herokuapp.com/', 'http://localhost:1234'];
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));





// Import express-validator to validate input fields
const { check, validationResult } = require('express-validator');

// Import auth.js file
let auth = require('./auth')(app);

// Require passport module & import passport.js file
const passport = require('passport');
require('./passport');

/* Connecting to MongoDB myFlixDB */
// a) Connect to Local DB
//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

// b) Connect to Hosted DB
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Log basic request data in terminal using Morgan middleware library
app.use(morgan('common'));


// READ: Return a list of ALL movies to the user
app.get("/movies", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then(function (movies) {
      res.status(201).json(movies);
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});


// READ: Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
   Movies.findOne({ 'Title': req.params.Title }) // Find the movie by title
     .then((movie) => {
       if (movie) { // If movie was found, return json, else throw error
         res.status(200).json(movie);
       } else {
         res.status(400).send('Movie not found');
       };
     })
     .catch((err) => {
       res.status(500).send('Error: ' + err);
     });
 });


// READ: Return data about a genre (description) by name/title (e.g., “Fantasy”)
app.get('/movies/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name }) // Find one movie with the genre by genre name
    .then((movie) => {
      if (movie) { // If a movie with the genre was found, return json of genre info, else throw error
        res.status(200).json(movie.Genre);
      } else {
        res.status(400).send('Genre not found');
      };
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
});

// READ: Return data about a director (bio, birth year, death year) by name
app.get('/movies/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name }) // Find one movie with the director by name
    .then((movie) => {
      if (movie) { // If a movie with the director was found, return json of director info, else throw error
        res.status(200).json(movie.Director);
      } else {
        res.status(400).send('Director not found');
      };
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
});

// CREATE: Allow new users to register, no jwt authentication needed!
// Username, Password & Email are required fields!
app.post('/users',
  // Validation logic
  [
    check('Username', 'Username is required (min 3 characters).').isLength({ min: 3 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required.').not().isEmpty(),
    check('Email', 'Email does not appear to be valid.').isEmail()
  ], (req, res) => {

    // Check validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password); // Create hashedPassword from given Password

    // Create new user
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) { // If the same username already exists, throw an error
          return res.status(400).send('User with the Username ' + req.body.Username + ' already exists!')
        } else { // If the username is unique, create a new user with the given parameters from the request body
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword, // Store only hashed password
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((err) => {
              console.error(err);
              res.status(500).send('Error: ' + err);
            })
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// READ: Return a list of ALL users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ: Return data on a single user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      if (user) { // If a user with the corresponding username was found, return user info
        res.status(200).json(user);
      } else {
        res.status(400).send('User with the username ' + req.params.Username + ' was not found');
      };
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// UPDATE: Allow users to update their user info (find by username), expecting request body with updated info
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
  // Validation logic
  [
    check('Username', 'Username is required (min 3 characters).').isLength({ min: 3 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric()
  ], (req, res) => {
    // Check validation object for errors
    let errors = validationResult(req);
    let hashedPassword = undefined;

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // If Password is given in request body, create hashedPassword from given Password
    if(req.body.hasOwnProperty('Password')){
      hashedPassword = Users.hashPassword(req.body.Password);
    }

    Users.findOneAndUpdate({ Username: req.params.Username }, // Find user by existing username
      {
        $set: { // Info from request body that can be updated
          Username: req.body.Username,
          Password: hashedPassword, // Store only hashed password
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true }) // Return the updated document
      .then((updatedUser) => {
        res.json(updatedUser); // Return json object of updatedUser
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// CREATE: Allow users to add a movie to their list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, // Find user by username
    { $push: { FavoriteMovies: req.params.MovieID } }, // Add movie to the list
    { new: true }) // Return the updated document
    .then((updatedUser) => {
      res.json(updatedUser); // Return json object of updatedUser
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE: Allow users to remove a movie from their list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, // Find user by username
    { $pull: { FavoriteMovies: req.params.MovieID } }, // Remove movie from the list
    { new: true }) // Return the updated document
    .then((updatedUser) => {
      res.json(updatedUser); // Return json object of updatedUser
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE: Allow existing users to deregister
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username }) // Find user by username
    .then((user) => {
      if (user) { // If user was found, return success message, else return error
        res.status(200).send('User with the Username ' + req.params.Username + ' was sucessfully deleted.');
      } else {
        res.status(400).send('User with the Username ' + req.params.Username + ' was not found.');
      };
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
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
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
