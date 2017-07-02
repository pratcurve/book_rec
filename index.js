var fs = require('fs');
var csvParse = require('csv-parse');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var app = express();

//configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json({'type':'application/vnd.api+json'}));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(session({secret:'rec', httpOnly: false}));

mongoose.connect('mongodb://localhost:27017/book_rec', {server:{poolSize:5}}, function(err){
  if (err) {
    console.log("connection:" + err);
  }
});

require('./app/Routes/routes')(app);

app.listen(8080);


