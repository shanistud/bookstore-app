'use strict';
  
angular.module('bookstoreApp.controllers')

.controller('NavCtrl', [
'$scope',
'$state',
'authService',
function($scope, $state,authService)
{
	$scope.isLoggedIn = authService.isLoggedIn;
	
	$scope.currentUser = authService.currentUser;

	$scope.logOut = function()
	{
		$state.go('login');

		authService.logOut().then(function()
		{
			$state.go('login');
		});
	};


}]);