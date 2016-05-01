var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var UserModel = mongoose.model('User');
var routeUtils = require('./route.utils');
var passport = require('passport');
var roles = require ('../models/Roles');
var sessions = require('../sessions/sessions.service');


//temp for dev only
//get all users
router.get('/', function(req, res, next) 
{
  UserModel.find().exec(function(err, users)
  {
    if(err)
    { 
    	return next(err); 
    }
    res.json(users);
  });
});


//login
router.post(routeUtils.constants.LOGIN_COMMAND, function(req, res, next)
{
  if(!req.body.username || !req.body.password)
  {
  	return next(routeUtils.createError('missing fields', 400));
  }

  var user = new UserModel();
  user.username = req.body.username;
  user.setPassword(req.body.password);
  
  passport.authenticate('local', function(err, user, info)
  {
    if(err)
    { 
    	return next(err);
    }

	//login success - create token and store session
    if(user)
    {
    	var jwToken = user.generateJWT();
    	sessions.createSession(jwToken, user, function(err, reply)
    	{
    		if(err)
    		{
    			return next(err);
    		}
    		
    		return res.send(JSON.stringify({token: jwToken, user: {username: user.username, 
    			role: (user.role === roles.ROLE_ADMIN ? 'admin' : 'client')} } ));
    	});
    } 
    else 
    {
    	 return next(routeUtils.createError(info.message, 401));
    }
  })(req, res, next);
});



//logout
router.post(routeUtils.constants.LOGOUT_COMMAND, function(req, res, next)
{
	if(req.session && req.session.token)
	{
		sessions.deleteSession(jwt, function(err, reply) 
		{ 
			if (err)
			{
				return next(err);
			}
			res.sendStatus(200);
		});
	}
	else
	{
		res.sendStatus(200);
	}
});



//register regular user
router.post(routeUtils.constants.REGISTER_ENDPOINT, function(req, res, next)
{
	if(!req.body.username || !req.body.password)
  	{
  		return next(routeUtils.createError('missing fields', 400));
  	}

  	registerUser(req.body.username, req.body.password, roles.ROLE_CLIENT, function(err, user)
    {
    	if (err)
    	{
    		return next(err); 
    	}
    	
    	var jwToken = user.generateJWT();
    	sessions.createSession(jwToken, user, function(err, reply)
    	{
    		if(err)
    		{
    			return next(err);
    		}
    		
    		return res.send(JSON.stringify({token: jwToken, user: {username: user.username, 
    			role: (user.role === roles.ROLE_ADMIN ? 'admin' : 'client')} } ));
    	});
    });
});


//register admin (only admin can create admins)
router.post(routeUtils.constants.REGISTER_ENDPOINT + '/admin', 
 function(req, res, next)
{
	if(!req.body.username || !req.body.password)
  	{
  		return next(routeUtils.createError('missing fields', 400));
  	}
  	if (!req.session || req.session.user.role !== roles.ROLE_ADMIN)
  	{
  		return next(routeUtils.createError('only admin can create admin', 401));
  	}
  	
  	registerUser(req.body.username, req.body.password, roles.ROLE_ADMIN, function(err, user)
    {
    	if (err)
    	{
    		return next(err); 
    	}
    	
    	var jwToken = user.generateJWT();
    	sessions.createSession(jwToken, user, function(err, reply)
    	{
    		if(err)
    		{
    			return next(err);
    		}
    		
    		return res.send(JSON.stringify({token: jwToken, user: {username: user.username, 
    		role: (user.role === roles.ROLE_ADMIN ? 'admin' : 'client')} } ));
    	});
    });
});



var registerUser = function(username, password, role, callback)
{
  var user = new UserModel();

  user.username = username;
  user.setPassword(password);
  user.role = role;
  
  user.save(function (saveErr)
  {
    if(saveErr)
    { 
    	err = saveErr;
    	callback(err);
    }
    else
    {
    	callback(null, user); 
    }
  });
};


// var loginUser(

registerUser('admin', '1234', roles.ROLE_ADMIN, function(err, callback) {});


module.exports = router;