'use strict';
  
angular.module('bookstoreApp.services')

.factory('authService', ['$http', '$window', '$location', function($http, $window, $location)
{
	var authApiBaseAdress = 'http://' + $location.host() + ':' + $location.port() + '/users';
	var tokenStorageKey = 'bookstoreApp-token';
	var userInfoStorageKey = 'bookstoreApp-userInfo';
	
	var auth = {};
	
	auth.saveLoginData = function (data)
	{
		$window.localStorage[tokenStorageKey] = data.token;
		$window.localStorage[userInfoStorageKey] = JSON.stringify(data.user);
	};
	
	auth.getToken = function ()
	{
		return $window.localStorage[tokenStorageKey];
	};
	
	auth.getUserInfo = function ()
	{
		if ($window.localStorage[userInfoStorageKey])
		{
			return JSON.parse($window.localStorage[userInfoStorageKey]);
		}
		
		return null;
	};
	
	auth.isAdmin = function()
	{
		var userinf = auth.getUserInfo();
		var role = userinf.role;
		return auth.getUserInfo() != null && auth.getUserInfo().role === 'admin';
	};
	
	auth.isLoggedIn = function()
	{
		
		var token = auth.getToken();

		if(token)
		{
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} 
		else
		{
			return false;
		}
	};
	
	auth.currentUser = function()
	{
		if(auth.isLoggedIn())
		{
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};
	
	auth.logIn = function(user, callback)
	{
		return $http.post(authApiBaseAdress + '/login', user)
		.success(function(data)
		{
			auth.saveLoginData(data);
			callback(null, data);
		})
		.error(function(err) 
		{
			callback(err);
		});
	};
	
	auth.register = function(user, adminRegistration, callback)
	{
		var path = adminRegistration ? '/register/admin' : '/register';
		return $http.post(authApiBaseAdress + path, user)
		.success(function(data)
		{
			if (!adminRegistration)
			{
				auth.saveLoginData(data);
			}
			callback(null, data);
		})
		.error(function(err) 
		{
			callback(err);
		});
	};
	
	auth.logOut = function()
	{
		$window.localStorage.removeItem(tokenStorageKey);
		
		return $http.post(authApiBaseAdress + '/logout');
	};

	auth.getAuthHeaders = function()
  	{
		var options = {};
		options.headers = {};
	
		if (auth.getToken() != null)
		{
			options.headers.Authorization = 'Bearer '+auth.getToken();
		}
		
		return options;
  	};
  	
  	auth.handle401Error = function(error)
  	{
  		if (error.status === 401)
		{
			if (error.data.fault && 
			   (error.data.fault === 'Invalid session token' || 
			    error.data.fault === 'No auth provided'))
			{
				auth.logOut().then(function() 
				{ 
					$state.go('login');
				});
			}
		}
  	};
  	
	return auth;
}]);


