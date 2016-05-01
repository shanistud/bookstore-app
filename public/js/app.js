'use strict';
  
var app = angular.module('bookstoreApp', 
['ui.router',
'ui.bootstrap',
'bookstoreApp.services',
'bookstoreApp.controllers']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) 
{
	$stateProvider
	
	.state('home',
	{
		url: '/admins',
		templateUrl: '/partials/admins.ejs',
		controller: 'AdminsCtrl' ,
		onEnter: ['$state', 'authService', function($state, authService)
		{
	 		if(!authService.isLoggedIn())
	 		{
				$state.go('login');
			}
		}]
		// ,
// 		resolve: 
// 		{
// 			postPromise: ['booksService', function(booksService)
// 			{
// 				return booksService.getAll();
// 			}]
// 		}
	})
    
    .state('clients',
	{
		url: '/clients',
		templateUrl: '/partials/clients.ejs',
		controller: 'ClientsCtrl',
		onEnter: ['$state', 'authService', function($state, authService)
		{
	 		if(!authService.isLoggedIn())
	 		{
				$state.go('login');
			}
		}]
	})
	
	.state('books', 
	{
	  url: '/books/{id}',
	  templateUrl: '/partials/books.ejs',
	  controller: 'BooksCtrl',
		onEnter: ['$state', 'authService', function($state, authService)
		{
	 		if(!authService.isLoggedIn())
	 		{
				$state.go('login');
			}
		}]
	})
	
	.state('login', 
	{
		url: '/login',
		templateUrl: '/partials/login.ejs',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'authService', function($state, authService)
		{
	 		if(authService.isLoggedIn())
	 		{
				$state.go('home');
			}
		}]
	})
	
	.state('register', 
	{
		  url: '/register',
		  templateUrl: '/partials/register.ejs',
		  controller: 'AuthCtrl',
		  onEnter: ['$state', 'authService', function($state, authService)
		  {
		  	if(authService.isLoggedIn())
		  	{
		  		$state.go('home');
		  	}
		  }]
});
     
  $urlRouterProvider.otherwise('login');
}]);

angular.module('bookstoreApp.services', []);
angular.module('bookstoreApp.controllers', []);


