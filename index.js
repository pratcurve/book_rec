var fs = require('fs');
var csvParse = require('csv-parse');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var app = express();

app.use(function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', "http://isbndb.com");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json({'type':'application/vnd.api+json'}));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(session({secret:'rec', httpOnly: false}));

mongoose.connect('mongodb://localhost:27017/boo_rec', function(err){
  if (err) {
    console.log("connection:" + err);
  }
});

require('./app/Routes/routes')(app);

app.listen(8080);


