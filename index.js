// Imports the express module and the Morgan module
const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');
const app = express();


let users = [
    {
        id: 1,
        name: "Kim",
        favoriteMovies: []
    },
    {
        id: 2,
        name: "Joe",
        favoriteMovies: ["The shawshank redemption"]
    }
];

let movies = [
    {
        "Title": "The shawshank redemption",
        "Genre": {
            "Name": "Drama"
        },
        "Director": {
            "Name": "Frank Darabont"
        }
    },
    {
        "Title": "Snatch",
        "Genre": {
            "Name": "Crime"
        },
        "Director": {
            "Name": "Guy Ritchie"
        }
    },
    {
        "Title": "Joker",
        "Genre": {
            "Name": "Crime"
        },
        "Director": {
            "Name": "Todd Phillips"
        }
    },
    {
        "Title": "Pulp Fiction",
        "Genre": {
            "Name": "Drama"
        },
        "Director": {
            "Name": "Quentin Tarantino"
        }
    },
    {
        "Title": "Goodfellas",
        "Genre": {
            "Name": "Crime"
        },
        "Director": {
            "Name": "Martin Scorsese"
        }
    }];

    let directors = [
      {
        name: 'Todd Phillips',
        description: 'Todd Phillips is an American filmmaker and actor who got his start by directing the comedy films Road Trip and Old School, the earlier inspired EuroTrip. He also directed Starsky & Hutch, The Hangover trilogy, Due Date, War Dogs and School for Scoundrels. Phillips directed Joker',
        birth_year: 1970,
        death_year: null

      },
    {
      name:"Frank Darabont",
      description:"Three-time Oscar nominee Frank Darabont was born in a refugee camp in 1959 in Montbeliard, France, the son of Hungarian parents who had fled Budapest during the failed 1956 Hungarian revolution. Brought to America as an infant",
      birth_year: 1959,
      death_year: null
    },

    {
      name:"Martin Scorsese",
      description: "Martin Charles Scorsese is an American film director, producer, and screenwriter. He is the recipient of many accolades, including nine Academy Award nominations for Best Director, four British Academy Film Awards, three Golden Globe Awards, and two Directors Guild of America Awards.",
      birth_year: 1942,
      death_year: null
    },

    {
      name: "Quentin Tarantino",
      description:"Quentin Jerome Tarantino is an American filmmaker, film critic, and actor. His films are characterized by nonlinear storylines, dark humor, stylized violence, extended dialogue, pervasive use of profanity, ensemble casts, references to popular culture, alternate history, and neo-noir.",
      birth_year: 1963,
      death_year: null
    },


  ];





//CREATE
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
      res.status(400).send('users need names')
    }
})


//UPDATE
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

   let user = users.find( user => user.id == id );

   if (user) {
      user.name = updatedUser.name
      res.status(200).json(user);
  } else {
    res.status(400).send('no such user')
  }

})

//CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;


   let user = users.find( user => user.id == id );

   if (user) {
      user.favoriteMovies.push(movieTitle);
      res.status(200).send('${movieTitle} has been added to user ${id}s array');;
  } else {
    res.status(400).send('no such user')
  }

})

//DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;


   let user = users.find( user => user.id == id );

   if (user) {
      user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
      res.status(200).send('${movieTitle} has been removed from user ${id}s array');;
  } else {
    res.status(400).send('no such user')
  }

})

//DELETE
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;


   let user = users.find( user => user.id == id );

   if (user) {
      users = users.filter( user => user.id != id);
      res.status(200).send('user ${id} has been deleted' );
  } else {
    res.status(400).send('no such user')
  }

})



//READ
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
})

//READ
app.get('/movies/:title', (req, res) =>{
  const { title } = req.params;
  const movie = movies.find((movie) => movie.Title === title );

  if (movie) {
     res.status(200).json(movie);
  } else {
     res.status(400).send('no such movie')
  }

})


//READ
app.get('/movies/genre/:genreName', (req, res) =>{
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

  if (genre) {
     res.status(200).json(genre);
  } else {
     res.status(400).send('no such genre')
  }

})


//READ
app.get('/movies/directors/:directorName', (req, res) =>{
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director.Name === directorName ).Director;

  if (director) {
     res.status(200).json(director);
  } else {
     res.status(400).send('no such director')
  }

})

//READ
app.get('/directors', (req, res) => {
  res.status(200).json(directors);
});



// Server listens to Port 8080. For HTTP Port 80 is the default Port
app.listen(8080, () => {
    console.log('Your app is listening to Port 8080.');
});
