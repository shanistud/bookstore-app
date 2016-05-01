'use strict';
  
angular.module('bookstoreApp.services')

.factory('genreService', ['$http', '$location', 'authService', function($http, $location, authService)
{
	var genreApiBaseAdress = 'http://' + $location.host() + ':' + $location.port() + '/api/genres';
	var o = 
	{
		getAll: function()
		{
			return $http.get(genreApiBaseAdress, authService.getAuthHeaders());
		},

		getGenre: function(id)
		{
			return $http.get(genreApiBaseAdress + '/' + id,  authService.getAuthHeaders());
		}
	}

	return o;
}]);