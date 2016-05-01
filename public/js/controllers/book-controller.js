'use strict';
  
angular.module('bookstoreApp.controllers')

.controller('BooksCtrl', [
'$scope', 
'$state', 
'booksService',
'authService',
'genreService',
function($scope, $state, booksService, authService, genreService)
{
	var setMessage = function(content, isError, time)
	{
		if(isError)
		{
			$scope.error = content;
		}
		else
		{
			$scope.successMessage = content;
		}
		if (time)
		{
			setTimeout(function() 
			{
				$scope.successMessage = null;
				$scope.error = null;
			}, time);
		}
	}
	
	$scope.loadBookDefualt = function()
	{
		booksService.getBook($state.params.id).then(
		function(res) 
		{
			$scope.book = res.data;
		}, 
		function(error) 
		{ 
			if (error.status === 401)
			{
				authService.handle401Error(error);
			}
		});
	};
	
		
	$scope.genreSelected = function(genre)
	{
		$scope.book.genre = genre;
	};
	
	
	var loadGenres = function()
	{
		genreService.getAll().then(
		function(res) 
		{
			$scope.allGenres = res.data;
		}, 
		function(error) 
		{ 
			if (error.status === 401)
			{
				authService.handle401Error(error);
			}
			else
			{
				$scope.error = error;
				setTimeout(function() { $scope.error = null }, 4000);
			}
		});
	};
		
	$scope.saveBook = function()
	{
		var bookToSave = { name: $scope.book.name, description: $scope.book.description, genre:  $scope.book.genre._id};
		booksService.saveBook(bookToSave, $scope.book._id).then(
		function(res) 
		{
			setMessage('book saved successfuly', false, 4000);
		}, 
		function(error) 
		{ 
			if (error.status === 401)
			{
				authService.handle401Error(error);
			}
			else
			{
				setMessage(error, true, 4000);
			}
		});
	};

	$scope.deleteBook = function()
	{
		booksService.deleteBook($scope.book._id).then(
		function(res) 
		{
			setMessage('book deleted successfuly', false, null);
			setTimeout(function()
			{
				$state.go('home');
			}, 3000);
		}, 
		function(error) 
		{ 
			if (error.status === 401)
			{
				authService.handle401Error(error);
			}
			else
			{
				setMessage(error, true, 4000);
			}
		});
	};

	$scope.createBook = function()
	{
		var bookToSave = { name: $scope.book.name, description: $scope.book.description, genre:  $scope.book.genre._id};
		booksService.createBook(bookToSave).then(
		function(res) 
		{
			setMessage('book created successfuly', false, 4000);
			$scope.book._id = res.data._id;
		}, 
		function(error) 
		{ 
			if (error.status === 401)
			{
				authService.handle401Error(error);
			}
			else
			{
				setMessage(error, true, 4000);
			}
		});
	};

		
	var init = function()
	{
		loadGenres();
		$scope.loadBookDefualt();
	}

	init();
}]);
