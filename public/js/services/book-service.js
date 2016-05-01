'use strict';
  
angular.module('bookstoreApp.services')

.factory('booksService', ['$http', '$location', 'authService', function($http, $location, authService)
{
	var booksApiBaseAdress = 'http://' + $location.host() + ':' + $location.port() + '/api/books';

	var _books = [];

	var _selectedBook = {};

	var _bookResults = [];
	
	var o = 
	{
		books: _books,

		selectedBook: _selectedBook,

		bookResults: _bookResults,
		
		getAll: function(limit, pageNum, searchPhrase)
		{
			var uri = booksApiBaseAdress + '?limit=' + limit + '&page=' + pageNum;
			
			if (searchPhrase)
			{
				uri = uri + '&q=' + searchPhrase;
			}
			return $http.get(uri, authService.getAuthHeaders());
		},

		getBook: function(id)
		{
			return $http.get(booksApiBaseAdress + '/' + id,  authService.getAuthHeaders());
		},
		
		saveBook: function(bookToSave, id)
		{
			return $http.post(booksApiBaseAdress + '/' + id, JSON.stringify(bookToSave), authService.getAuthHeaders());
		},
		
		deleteBook: function(id)
		{
			return $http.delete(booksApiBaseAdress + '/' + id, authService.getAuthHeaders());
		},
		
		createBook: function(bookToCreate)
		{
			return $http.post(booksApiBaseAdress, JSON.stringify(bookToCreate), authService.getAuthHeaders());
		}
	}

	return o;
}]);