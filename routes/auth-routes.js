// routes/auth-routes.js
const express = require("express");
const authRoutes = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");
const nodemailer = require("nodemailer");
// User model
const User = require("../models/user");
const cookieSession = require('cookie-session'); 
const session = require('express-session');
var smtpTransport = require('nodemailer-smtp-transport');
var handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');
var callback = () => console.log("Callback has been called!");

// Bcrypt to encrypt passwords
const bcrypt     = require("bcryptjs");
const bcryptSalt = 10;

//route to "signup" page
authRoutes.get("/", (req, res, next) => {
  res.render("auth/signup");
});

//route to "login" page
authRoutes.get("/login", (req, res, next) => {
  res.render("auth/login");
});

//route login 
authRoutes.post("/login", urlencodedParser, (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/login", {
      errorMessage: "Indicate a username and a password to log in"
    });
    return;
  };

  User.findOne({ "username": username}, 
    (err, user) => {
      if (err || !user) {
        res.render("auth/login", {
          errorMessage: "The username doesn't exist"
        });
        return;
      } else {
        if (bcrypt.compareSync(password, user.password)) {
          req.session.currentUser = user;
          res.redirect('/demo-page');
        } else {
          res.render("auth/login", {
            errorMessage: "Incorrect password"
          });
        }
      }
  });
});

//route signup
authRoutes.post("/signup", urlencodedParser, (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    var salt = bcrypt.genSaltSync(bcryptSalt);
    var hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass
    });

    newUser.save((err) => {
      if (err) {
        res.render("auth/signup", { message: "Something went wrong" });
      } else {
        res.redirect("/");
      }
    });
  });
});

authRoutes.get("/logout", urlencodedParser, (req, res) => {
  req.logout();
  res.redirect("/login");
});


module.exports = authRoutes;