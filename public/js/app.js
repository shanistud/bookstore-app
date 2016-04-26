'use strict';
  
var app = angular.module('bookstoreApp', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: 
      {
   		postPromise: ['books', function(books)
   		{
      		return books.getAll();
         }]}})
    
    .state('books', {
      url: '/books/{id}',
      templateUrl: '/books.html',
      controller: 'BooksCtrl'
    });
     
  $urlRouterProvider.otherwise('home');
}]);


app.factory('books', ['$http', function($http)
{
  var _books = [];
  var _selectedBook = {};
  var o = {
  			books: _books,
  			selectedBook: _selectedBook,
  			
            getAll: function()
            {
            	 $http.get('http://localhost:3000/api/books').success(function(data)
            	{
					angular.copy(data, _books);
      			});
      			
      			return this.books;
            },
            
            getBook: function(id)
            {
            
            	 $http.get('http://localhost:3000/api/books/' + id).success(function(data)
            	{
					angular.copy(data, _selectedBook);
      			});
      			
      			return this.selectedBook;
            }
            
          }
          
  return o;
}]);


app.controller('MainCtrl', [
'$scope', 
'books',
function($scope, books)
{
	
    $scope.books = books.getAll();
  
  // $scope.searchBooks = function(){
//   };
  
}]);

app.controller('BooksCtrl', [
'$scope', 
'$stateParams',
'books',
function($scope, $stateParams, books)
{
	$scope.book = books.getBook($stateParams.id);
}]);
