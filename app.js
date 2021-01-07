//jshint esversion:6
//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
// const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/secretDB ', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

// const Cat = mongoose.model('Cat', {
//     name: String
// });



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});






app.listen(3000, function () {
    console.log("Server started on port 3000.");
});
