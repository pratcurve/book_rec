var mongoose = require('mongoose');

var User = mongoose.model('users',{
	email: String,
	likes: Array,
	similarity: Array,
	recomm: Array
});

module.exports = User;