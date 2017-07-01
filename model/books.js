var mongoose = require('mongoose');

var Books = mongoose.model('books', {
	ISBN: String,
	likedBy: Array
});

module.exports = Books;