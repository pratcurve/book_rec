//Controllers
var HomeController = require('./../controllers/HomeController');
var SignUpController = require('./../controllers/SignUpController');

//All the routes
module.exports = function(app) {
  //GET Login route
  app.get('/login', SignUpController.getLogin);
  //Post Login route
  app.post('/login', SignUpController.postLogin);
  //GET logout route
  app.get('/logout', SignUpController.getLogout);
  //GET route to index page
  app.get('/', SignUpController.isAuthenticated, HomeController.index);
  //GET Route, AJAX reques to show books on index page
  app.get('/api/books', SignUpController.isAuthenticated, HomeController.getBooks);
  //GET Route, AJAX request like book
  app.get('/api/book/:book', SignUpController.isAuthenticated, HomeController.getLikeBook);
  //GET Route, AJAX request recommendation
  app.get('/api/recommendation', SignUpController.isAuthenticated, HomeController.getRecommendation);
  //GET Route, AJAX request Books liked by user
  app.get('/api/liked', SignUpController.isAuthenticated, HomeController.getLikedBooks);
}