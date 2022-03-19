// Load express framework
const express = require('express');
const app = express();
// Import middleware libraries: Morgan, body-parser, and uuid
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

// Connecting to MongoDB FemMoviesDB
mongoose.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true });

// Log basic request data in terminal using Morgan middleware library
app.use(morgan('common'));

// READ: Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
console.log("movies endpoint");
  Movies.find()
    .then((movies) => {
      console.log("Movies", movies);
      res.status(200).json(movies);
    })
    .catch((err) => {
      res.status(500).send('Error: '+ err);
    });
});

// READ: Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
app.get('/movies/:title', (req, res) => {
  Movies.findOne({ Title: req.params.title}) // Find the movie by title
    .then((movie) => {
      if(movie){ // If movie was found, return json, else throw error
        res.status(200).json(movie);
      } else {
        res.status(400).send('Movie not found');
      };
    })
    .catch((err) => {
      res.status(500).send('Error: '+ err);
    });
});

// READ: Return data about a genre (description) by name/title (e.g., “Fantasy”)
app.get('/movies/genre/:Name', (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name}) // Find one movie with the genre by genre name
    .then((movie) => {
      if(movie){ // If a movie with the genre was found, return json of genre info, else throw error
        res.status(200).json(movie.Genre);
      } else {
        res.status(400).send('Genre not found');
      };
    })
    .catch((err) => {
      res.status(500).send('Error: '+ err);
    });
});

// READ: Return data about a director (bio, birth year, death year) by name
app.get('/movies/director/:Name', (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name}) // Find one movie with the director by name
    .then((movie) => {
      if(movie){ // If a movie with the director was found, return json of director info, else throw error
        res.status(200).json(movie.Director);
      } else {
        res.status(400).send('Director not found');
      };
    })
    .catch((err) => {
      res.status(500).send('Error: '+ err);
    });
});
// CREATE: Allow new users to register
// Username, Password & Email are required fields!
app.post('/users', (req, res) => {
  Users.findOne({Username : req.body.Username})
    .then((user) => {
      if(user) { // If the same username already exists, throw an error
        return res.status(400).send('User with the Username ' + req.body.Username + ' already exists!')
      } else { // If the username is unique, create a new user with the given parameters from the request body
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => {res.status(201).json(user)})
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
app.get('/users', (req, res) => {
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
app.get('/users/:Username', (req, res) => {
  Users.findOne({Username: req.params.Username})
    .then((user) => {
      if(user){ // If a user with the corresponding username was found, return user info
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
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username : req.params.Username}, // Find user by existing username
    {$set: { // Info from request body that can be updated
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
      }
    },
    { new : true }) // Return the updated document
    .then((updatedUser) => {
        res.json(updatedUser); // Return json object of updatedUser
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// CREATE: Allow users to add a movie to their list of favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({Username : req.params.Username}, // Find user by username
    {$push: { FavoriteMovies: req.params.MovieID}}, // Add movie to the list
    { new : true }) // Return the updated document
    .then((updatedUser) => {
        res.json(updatedUser); // Return json object of updatedUser
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE: Allow users to remove a movie from their list of favorites
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({Username : req.params.Username}, // Find user by username
    {$pull: { FavoriteMovies: req.params.MovieID}}, // Remove movie from the list
    { new : true }) // Return the updated document
    .then((updatedUser) => {
        res.json(updatedUser); // Return json object of updatedUser
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE: Allow existing users to deregister
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username : req.params.Username}) // Find user by username
    .then((user) => {
      if(user){ // If user was found, return success message, else return error
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
// Listen to port 8000
const port = 8000;
app.listen(port, () => {
  console.log('Your app is listening on port ' + port);
});
