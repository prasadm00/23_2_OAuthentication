//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose')
const app = express();
const session = require('express-session');
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require('passport');


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(
    session({
        secret: "Our little secret.",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
console.log("Key==>>", process.env.SECRET);
mongoose.connect("mongodb://localhost:27017/userDB").then((result) => {
    console.log('Connected Successfully To the DB!');
}).catch((err) => {
    console.log("Error===>>>", err);
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);
// var secret = process.env.SECRET;

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get("/", function (req, res) {
    res.render("home");
});
app.get("/login", function (req, res) {
    res.render("login");
});
app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/secrets", function (req, res) {
    console.log("Inside secrets");
    if (req.isAuthenticated()) {
        console.log("authenticated");
        res.render("secrets");
    } else {
        console.log("Not authe");
        res.redirect("/login")
    }
})

app.get("/logout", function (req, res) {
    console.log("Inside logout");
    req.logout(function (res, err) {
        if (err) {
            res.send(err)
        }
        console.log("Inside logout function");
    });
    res.redirect("/")
})

app.post("/register", function (req, res) {
    console.log("Inside register");
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log("Error", err);
            res.redirect('/register')
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            })
        }
    })
})

app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, function (err) {
        if (err) {
            console.log("Error", err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")

            })
        }
    })
})

app.listen(3000, function () {
    console.log("server started on port 3000");
})
