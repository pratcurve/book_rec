var app = angular.module('bookApp', []);
app.controller('homeController', function($scope, $http){
  $scope.booksArray = [];
  $http.get('/api/books')
  .then(function(response){
    var books = response.data
    books.forEach(function(book){
      // bookDetails.coverUrl = "http://covers.openlibrary.org/b/isbn/" + book.ISBN + "-M.jpg";
      book.url = "http://covers.openlibrary.org/b/isbn/"+book.ISBN+"-M.jpg";
      book.likeImage = "/unlike_32.png";
      $scope.booksArray.push(book);
    })
    getLikedBooks();
    recommendation();
    // getBookDetails();
  });

  $scope.likeBook = function(book) {
    $http.get('/api/book/'+ book.ISBN)
    .then(function(response){
      toggleLikeImage(book);
      recommendation();
    })
  }

  var toggleLikeImage = function(book){
    book.likeImage = '/like_32.png';
    return;
  }

// update recommendation when ever user likes a book
  var recommendation = function() {
    $scope.recommBooks = [];
    $http.get('/api/recommendation')
    .then(function(response){
      var books = response.data;
      if (books.length) {
          books.forEach(function(book){
          book.ISBN = book.recomm.ISBN;
          book.url = "http://covers.openlibrary.org/b/isbn/"+book.ISBN+"-S.jpg";
          $scope.recommBooks.push(book);
          $scope.recommBook ="";
        });
      } else {
        $scope.recommBook = "No recommendation! Like some books.";
      }
    });
  }

  var getLikedBooks = function(){
    var likedBooks = [];
    $http.get('/api/liked')
    .then(function(response){
      likedBooks = response.data
      for (var i = 0; i < likedBooks.length; i++) {
        for (var j = 0; j < $scope.booksArray.length; j++) {
          if ($scope.booksArray[j].ISBN == likedBooks[i]) {
            $scope.booksArray[j].likeImage = "/like_32.png";
          }
        }
      }
    });
    return;
  }

  var getBookDetails = function(){
    $scope.booksArray.forEach(function(book){
      $http.get("http://isbndb.com/api/v2/json/FVSCO9FS/book/" + book.ISBN)
      .then(function(response){
        console.log(response)
      })
    })
  }
})