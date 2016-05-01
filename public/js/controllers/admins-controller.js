'use strict';
  
angular.module('bookstoreApp.controllers')

.controller('AdminsCtrl',
 ['$scope',
 '$state', 
  'booksService',
  'authService',
function($scope, $state, booksService, authService)
{
	var RESULTS_PER_PAGE = 10;
	var DEFAULT_GET_MODE = 1;
	var TEXT_SEARCH_MODE = 2;
	
	$scope.currentSearchMode = DEFAULT_GET_MODE;
	
	var handleQueryResults = function(res)
	{
		$scope.totalQueryResults = parseInt(res.data.totalCount);
		$scope.books = res.data.results;
		
		
		if ($scope.totalQueryResults < 1)
		{
			$scope.paginationHide = true;
			$scope.resultsMessage = 'No results found';
			$scope.currentPage = 1;
		}
		else 
		{
			if ($scope.totalQueryResults < RESULTS_PER_PAGE)
			{
				$scope.paginationHide = true;
			}
			else
			{
				$scope.paginationHide = false;
				$scope.queryPageCount = res.data.totalCount / RESULTS_PER_PAGE;
				$scope.resultsMessage = 'Total ' + res.data.totalCount + " results";
			}
		}
	};
		
	$scope.loadBooksDefault = function()
	{
		if ($scope.currentSearchMode === DEFAULT_GET_MODE)
		{
			$scope.bookSearchExp = null;
		}
		
		booksService.getAll(RESULTS_PER_PAGE, $scope.currentPage, $scope.bookSearchExp).then(
		function(res) 
		{
			handleQueryResults(res);
		}, 
		function(error) 
		{ 
			$scope.paginationHide = true;
			if (error.status === 401)
			{
				authService.handle401Error(error);
			}
		});
	};
	
	$scope.searchBooks = function()
	{
		if (!($scope.bookSearchExp) || $scope.bookSearchExp === "")
		{
			return;
		}
		else
		{
			$scope.currentSearchMode = TEXT_SEARCH_MODE;
		}
		
		booksService.getAll(RESULTS_PER_PAGE, $scope.currentPage, $scope.bookSearchExp).then(
		function(res) 
		{
			handleQueryResults(res);
		}, 
		function(error) 
		{ 
			$scope.paginationHide = true;
			if (error.status === 401)
			{
				authService.handle401Error(error);
			}
		});
	};
	
	$scope.setPage = function (pageNo) 
	{
		$scope.currentPage = pageNo;
	};

	$scope.pageChanged = function()
	{
		//$log.log('Page changed to: ' + $scope.currentPage);
	};
  
	var init = function()
	{
		$scope.resultsPerPage = RESULTS_PER_PAGE;
		$scope.resultsMessage = null;
// 		$scope.bookSearchExp = null;
// 		$scope.currentPage = ($state.params.page) ? ($state.params.page) : 1;
		$scope.loadBooksDefault();
	}
	
	init();
	
	

	
	
}]);