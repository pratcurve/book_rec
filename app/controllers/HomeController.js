var csv = require('csvtojson');
var User = require('./../../model/user');
var Books = require('./../../model/books');
var session = require('express-session');
var mongoose = require('mongoose');
var _ = require('underscore');

_.once(csvParser);

exports.index = function(req, res) {
  res.render('index.html', {username: req.session.username});
  res.end();
}

exports.getBooks = function(req, res){
  var booksInDb = [];
  Books.find({}, function(err, books){
    if (err) {
      res.send(err);
    }
    books.forEach(function(book){
      booksInDb.push(book.ISBN);
    });
    res.json(booksInDb);
  });
}

exports.getLikeBook = function(req, res){
  var books = [],
  notLiked = true;
  User.findOne({'_id': req.session.user_id}, function(err, book) {
    if (err) {
      res.send(err);
      res.end();
    } books = book.likes;
    books.forEach(function(book){
      if (book == req.params.book && notLiked) {
        notLiked = false;
        res.send(book);
        res.end();
      } 
    });
    if (notLiked == true) {
      User.findOneAndUpdate(
        {'_id': req.session.user_id},
        {$push:{'likes':req.params.book}},
        {new:true}, function(err, user) {
        Books.findOneAndUpdate(
          {'ISBN': req.params.book},
          {$push:{'likedBy': req.session.user_id}},
          {new:true}, function(err, book){
            //update user by book
          User.find({}, function(err, users){
            updateRecommendation(users, req.session.user_id, function(err, UpdatedRecomm){
              if (err) {
                res.send(err);
              }res.json("done");
            });
         }); 
        });           
      });
    }
 });
}

exports.getRecommendation = function(req, res){
  //get recommendation and send response to AJAX request
  User.aggregate([
    {$match:{_id: mongoose.Types.ObjectId(req.session.user_id)}}, 
    {$unwind: '$recomm'}, {$sort:{'recomm.recomm': -1}},
    {$limit: 5}], function(err, recomms){
      if (err) {
        console.log(err);
      } res.json(recomms);
  });
}

exports.getLikedBooks = function(req, res){
  User.findOne({'_id':req.session.user_id}, function(err, user){
    if (err) {
      res.send(err);
    } res.json(user.likes);
  });
}

var saveBooks = function(books) {
  books.forEach(function(book){
    Books.findOne({'ISBN': book.ISBN}, function(err, bookInDb){
      if (!bookInDb) {
        Books.create({
          'ISBN': book.ISBN
        }, function(err, book){
          if (err) 
            return false;
        });
      }
    });
  });
  return true;
}


var csvParser = function(callback) {
  const filePath = 'isbn.csv';
  var jsonArray = [];
  csv().
    fromFile(filePath)
    .on('json', function(csvRow){
      jsonArray.push(csvRow);
    })
    .on('end', function(err){
      if (err) {
        console.log(err);
      }
      saveBooks(jsonArray);
    });
}

// calculate similarity index of the user signed in with all the other users 
var updateSimilarity = function(others, user, callback) {
  var similarities = {};
  var similarityArray = [];
  for (var i = 0; i < others.length; i++) {
    if (others[i]._id ==  user) {
      user = others[i];
      break;
    }   
  }
  others.forEach(function(other){
    if (other._id == user._id) {
      return user._id;
    } 
    sim = (_.intersection(other.likes, user.likes).length) / (_.union(other.likes, user.likes).length);
    var similarities = {_id:other._id, similarity: sim};
    similarityArray.push(similarities);
  });
  User.findOneAndUpdate(
    {'_id': user._id},
    {$set: {'similarity': []}},
    {new: true}, function(err, userNew){
    if (err) {
      return;
    }
    User.findOneAndUpdate(
      {'_id':user._id},
      {$push: {'similarity':{$each: similarityArray}}},
      {new:true}, function(err, user){
      if (err) {
        res.send(err);
      } 
       callback (false, user);
    });
  });
}

var updateRecommendation = function(others, user_id, callback){
  var usersByBook = [],
    userSimlarities = [],
    finalRecomm = [],
    totalSim = 0,
    bookProbab = 0;
  updateSimilarity(others, user_id, function(err, user){
    if (err) {
      console.log(err);
    } 
    userSimlarities = user.similarity;
    Books.find({}, function(err, booksInDb){
      booksInDb.forEach(function(bookInDb){
        totalSim = 0;
        if (bookInDb.likedBy.length) {
          if (!_.contains(user.likes, bookInDb.ISBN)) {
            usersByBook = bookInDb.likedBy;
            userSimlarities.forEach(function(userSimilarity){
              if (usersByBook.indexOf(userSimilarity._id) != -1) {
                totalSim += userSimilarity.similarity;
              }
            });
            bookProbab = totalSim/(usersByBook.length);
            if (bookProbab) {
              var recommBook = {ISBN: bookInDb.ISBN, recomm : bookProbab};
              finalRecomm.push(recommBook);
            }
          }
        }
      });
      User.findOneAndUpdate(
        {'_id': user_id},
        {$set:{'recomm': []}}, function(err, user){
        if (err) {
          console.log(err);
        } 
        User.findOneAndUpdate(
          {'_id': user_id},
          {$push:{'recomm':{$each: finalRecomm}}}, function(err, UpdatedRecomm){
          if (err) {
            console.log(err)
          } callback(false, UpdatedRecomm);
        });
      });
    });
  });
}
