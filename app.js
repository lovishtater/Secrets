//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "i am lovish",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true
    }
}));

app.use(passport.initialize());
app.use(passport.session());



mongoose.connect('mongodb://localhost:27017/secretDB', { useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// code copied from https://www.npmjs.com/package/passport
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

// code copied from http://www.passportjs.org/packages/passport-google-oauth2/
passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        // passReqToCallback: true
    },
    function (request, accessToken, refreshToken, profile, done) {
        console.log(profile);
        User.findOrCreate({
            googleId: profile.id
        }, function (err, user) {
            return done(err, user);
        });
    }
));




app.get("/", function (req, res) {
    res.render("home");
});

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['email', 'profile']
    }));

app.get('/auth/google/secrets',
    passport.authenticate('google', {
        successRedirect: '/secrets',
        failureRedirect: '/login'
    }));

    app.get("/login", function (req, res) {
        res.render("login");
    });

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/secrets", function (req, res) {
    User.find({
        "secret": {
            $ne: null
        }
    }, function (err, foundUsers) {
        if (err) {
            console.log(err);
        } else {
            if (foundUsers) {
                res.render("secrets", {
                    usersWithSecrets: foundUsers
                });
            }
        }
    });
});

app.get("/submit", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("submit");
    } else {
        res.redirect("/login");
    }
});
app.get("/logout", function (req, res) {
    req.logout();
    // res.render("/err");
    setTimeout(function () {
        res.redirect("/");
    }, 5000);

});

app.post("/register", function (req, res) {
    // const newUser = new User({email: req.body.username,password: req.body.password});
    // newUser.save(function (err) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         res.render("Secrets");
    //     }
    // });
    User.register({username: req.body.username}, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function (err) {
                res.redirect("/secrets");
            });
        }
    });
});



app.post("/login", function (req, res) {
    // const username = req.body.username;
    // const password = req.body.password;

    // User.findOne({
    //     email: username
    // }, function (err, findUser) {
    //     if (err) {
    //         console.log(err);
    //     } else if (findUser.password === password) {
    //         res.render("Secrets");
    //     } else if (findUser.password !== password) {
    //         res.render("err");
    //     }
    // });
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function (err) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function (err) {
                res.redirect("/secrets");
            });
        }
    });
});





app.listen(3000, function () {
    console.log("Server started on port 3000.");
});