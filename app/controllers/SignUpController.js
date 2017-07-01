var User = require('./../../model/user');
var session = require('express-session');
var mongoose = require('mongoose');

exports.getLogin = function(req, res){
  res.render('login.html')
  res.end();
}

exports.postLogin = function(req, res){
  User.findOne({'email': req.body.username}, function(err, user){
    if (err) {
      res.redirect('/login');
    } if (!user) {
      createUser(req.body.username, function(err, user){
        // create session for new user
        if (err) {
          res.send(err)
        } 
        req.session.user_id = user._id;
        res.redirect('/');
      })
    } else{
      req.session.user_id = user._id;
      res.redirect('/');
    }
  });
}

exports.getLogout = function(req, res){
  req.session.destroy();
  res.redirect('/login');
  res.end();
}

exports.isAuthenticated = function(req, res, next){
  if(req.session.user_id)
    return next();
  res.redirect('/login');
}

var createUser = function(email, callback){
  User.create({
    'email': email,
    }, function(err, user){
      if (err) {
      callback(true, null)
      } callback(false, user)
 });
}