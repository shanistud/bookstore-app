const API_BASE_ADDRESS = "/api";
const BOOKS_ENDPOINT = "/books";
const GENRES_ENDPOINT = "/genres";
const USERS_BASE_ADDRESS = "/users";
const REGISTER_ENDPOINT = '/register';
const LOGIN_COMMAND = '/login';
const LOGOUT_COMMAND = '/logout';


var roles = require('../models/Roles'); 

var _isAuthorized = function(req, adminOnly)
{
	if (!req.session)
	{
		return false;
	}
	if (adminOnly && req.session.user.role !== roles.ROLE_ADMIN)
	{
		return false;
	}
	
	return true;
}


var _createError = function(message, status)
{
	var err = new Error(message);
	
	if (status)
	{
		err.status = status;
	}
	
	return err;
};

//public route utils
module.exports = 
{
	createError: _createError,
	
	isAuthorized: _isAuthorized,
	
	constants:
	{
  		API_BASE_ADDRESS: API_BASE_ADDRESS,
  		BOOKS_ENDPOINT: BOOKS_ENDPOINT,
  		GENRES_ENDPOINT: GENRES_ENDPOINT,
  		USERS_BASE_ADDRESS: USERS_BASE_ADDRESS,
  		REGISTER_ENDPOINT: REGISTER_ENDPOINT,
  		LOGIN_COMMAND: LOGIN_COMMAND,
  		LOGOUT_COMMAND: LOGOUT_COMMAND
  	 }
};