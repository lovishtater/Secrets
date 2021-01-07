//jshint esversion:6
//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/secretDB ', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const User = mongoose.model('User', {
    email: String,
    password: String
});

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register",function (req,) {
    
})






app.listen(3000, function () {
    console.log("Server started on port 3000.");
});