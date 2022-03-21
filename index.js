const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require ('uuid'),
  app = express();


//use bodaparser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const res = require('express/lib/response');

//import the "auth.js" file
let auth = require('./auth')(app);

//import the "passport.js" file
const passport = require('passport');
  require('./passport');

//import mongoose and the "models.js"
const mongoose = require('mongoose');
    Models = require('./models.js');
    Movies = Models.Movie;
    Users = Models.User;

  mongoose.connect ('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

  //morgan middleware, specifying that requests should be logged
app.use(morgan('common'));

// READ - return list of all movies + JWT authentication
app.get ('/movies', passport.authenticate('jwt', { session:false }), (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(200).json(movies);
  })
  .catch((err) => {
    res.status(500).send('Error: ' + err);
  });
});

//READ - return specific data about a singe movie
app.get('/movies/:title', passport.authenticate('jwt', { session:false }), (req, res) => {
  Movies.findOne({Title: req.params.title})
    .then((movie) => {
      if(movie){
        res.status(200).json(movie);
      }else{
        res.status(400).sendStatus('Movie not found.');
      };
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
});

//READ - return data about a genre by its name
app.get('/movies/genre/:Name', passport.authenticate('jwt', { session:false }), (req, res) => {
  Movies.findOne({'Genre.Name': req.params.Name})
    .then((movie) => {
      if(movie){
        res.status(200).json(movie.Genre);
      }else{
        res.status(400).send('Genre not found.');
      };
    })
    .catch((err) => {
      res.status(500).send('Error ' + err);
    });
});

//READ - return data about a director by their name
app.get('/movies/director/:Name', passport.authenticate('jwt', { session:false }), (req, res) => {
  Movies.findOne({'Director.Name': req.params.Name})
    .then((movie) => {
      if(movie){
        res.status(200).json(movie.Director);
      }else{
        res.status(400).send('Director not found.');
      };
    })
    .catch((err) => {
      res.status(500).send('Error ' + err);
    });
});

//CREATE - allows user to register (username, pw, email required)
app.post('/users', passport.authenticate('jwt', { session:false }), (req, res) => {
  Users.findOne({Username: req.body.Username})
    .then((user) => { //If the username already exists, show error message
      if(user) {
        return res.status(400).send('User with the Username ' + req.body.Username + ' already exists!')
      }else{
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => {
            res.status(201).json(user)
          })
          .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
          })
      }
    })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err);
  });
});

//READ - returns all the users
app.get('/users', passport.authenticate('jwt', { session:false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

//READ - returns data on a specific user
app.get('/users/:Username', passport.authenticate('jwt', { session:false }), (req, res) => {
  Users.findOne({Username: req.params.Username})
    .then((user) => {
      if(user){
        res.status(200).json(user);
      }else{
        res.status(400).send('User with the username ' + req.params.Username + ' was not found.');
      };
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
});

//UPDATE - allows users to update their personal information
app.put('/users/:Username', passport.authenticate('jwt', { session:false }), (req, res) => {
  Users.findOneAndUpdate({User: req.params.Username},
    {$set: { //information that can be updated
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new:true }) //returns the updated document
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err);
  });
});

//CREATE - allows user to add a movie to their favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session:false }), (req, res) => {
  Users.findOneAndUpdate({Username : req.params.Username},
    {$push: { FavoriteMovies: req.params.MovieID}},
    { new : true }) // Return the updated document
    .then((updatedUser) => {
        res.json(updatedUser); // Return json object of updatedUser
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//DELETE - allows user to delete a movie from their favorite
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session:false }), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username},
    {$pull: {FavoriteMovies: req.params.MovieID}},
    { new: true})//returns updated document
    .then((updatedUser) => {
      res.json(updatedUser); //returns json object of updated user
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

//DELETE - allows user to deregister
app.delete('/users/:Username', passport.authenticate('jwt', { session:false }), (req, res) => {
  Users.findOneAndRemove({Username: req.params.Username})
    .then((user) => {
      if(user){
        res.status(200).send('User with the username ' + req.params.Username + ' was successfully deleted.');
      }else{
        res.status(500).send('User with the username ' + req.params.Username + ' was not found.')
      };
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});


//Welcome message for the '/' URL
app.get('/', (req, res) => {
  res.send('Welcome to mehos movie application.');
});
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname});
});
//gives access to the static file
app.use(express.static('public'));
//error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('An error occured.');
});
//listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
