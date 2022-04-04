/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
const Movie = require("./Movies");

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

/* starting my code for /movie */
router.route('/movie')
    .post(authJwtController.isAuthenticated, function(req, res) { // add movie
            if (!req.body.title || !req.body.password || !req.body.genre || !req.body.actors.length < 3) {
                res.json({success: false, msg: 'Please include all required fields and 3 actors'})
            }
            else {
                var movie = new Movie();
                movie.title = req.body.title;
                movie.year = req.body.year;
                movie.genre = req.body.genre;
                movie.actors = req.body.actors;
                user.save(function(err){
                    if (err) {
                        return res.json(err);
                    }
                    res.json({success: true, msg: 'Successfully added movie to DB'})
                });

            }
        }
    )
    // get ALL movies
    .get(function(req, res) {
        Movie.find(function (err, result) {
            if(err) res.json({message: "ERROR: ", error: err});
            console.log(result.title)
            res.json(result);
        })
        }
    )

    .put(authJwtController.isAuthenticated, function(req, res) {
            res = res.status(200);
            res.json(
                {status: '200', message: 'movie updated', headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});
        }
    )
    .delete(authController.isAuthenticated, function(req, res) {
            Movie.deleteOne({title: req.body.title}, function (err, movie) {
                if (err) {
                    res.status(400).json({message: "ERROR: ", msg: err})
                } else if (movie == null) {
                    res.json({msg: "Move could not be found"})
                } else
                    res.json({msg: "Successfully removed movie from DB"})
            })
        }
    );
// get specific movie
router.route('/movie/:title')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.title;
        Movie.findOne({ name: 'Titanic'}, function (err, movie) {
            if (err) res.send(err);
            res.json(movie);
        })
    });
// all other requests
router.all('*', function(req, res) {
    res.json({ error: 'HTTP Method Not Supported' });
});
/* ending my code */

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


