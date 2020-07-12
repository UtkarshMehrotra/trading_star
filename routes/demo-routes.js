// routes/auth-routes.js
const express = require("express");
const demoRoutes = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");
const cookieSession = require('cookie-session'); 
const session = require('express-session');
var handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');
var callback = () => console.log("Callback has been called!");

/* GET home page. */
demoRoutes.get('/', function(req, res, next) {
  res.render('demo_page', { title: 'Trading star' });
});

module.exports = demoRoutes;