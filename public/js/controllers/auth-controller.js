'use strict';
  
angular.module('bookstoreApp.controllers')

.controller('AuthCtrl', [
'$scope',
'$state',
'authService',
function($scope,  $state, authService)
{
	$scope.user = {};

	var setMessage = function(content, isError)
	{
		if(isError)
		{
			$scope.error = content;
		}
		else
		{
			$scope.successMessage = content;
		}
	}
	
	$scope.register = function()
	{ 
		var adminRegistration = document.getElementById("adminCheck").checked === true;
		
		if (adminRegistration && !authService.isAdmin())
		{
			setMessage({fault: 'Registration of admins is only available for admins'}, true);
			return;
		}
		authService.register($scope.user, adminRegistration).error(function(error)
		{
			setMessage(error, true);
		})
		.then(function()
		{
			setMessage('Registration successful', false);
			setTimeout(function()
			{
				var homePage = authService.isAdmin() ? 'home' : 'clients';
				$state.go(homePage);
			}, 2000);
		});
	};
	
	$scope.logIn = function()
	{
		authService.logIn($scope.user, function(err, data)
		{
			if (err)
			{
				setMessage(error, true);
			}
			else
			{
				setMessage('logged in succesfully', false);
				setTimeout(function()
				{
					var homePage = authService.isAdmin() ? 'home' : 'clients';
					$state.go(homePage);
				}, 2000);
			}
		});
	};
	
	$scope.init = function()
	{
		$scope.error = null;
		$scope.successMessage = null;
		$scope.header = 'Register';
	}
	
	$scope.init();
	
	
}]);