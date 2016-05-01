var express = require('express');
var router = express.Router();
var config = require('../config/config');
var api = require('./api');
var users = require('./users');
var routeUtils = require('./route.utils');
var app = express();
var sessions = require('../sessions/sessions.service');
var jwt = require('jsonwebtoken');

var tryRetrieveSession = function(req, res, next)
{
	if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
	{
        var jwToken =  req.headers.authorization.split(' ')[1];
        
        sessions.retrieveSession(jwToken, function(err, reply)
        {
        	if (err)
        	{
        		return next(err);
        	}
        	if (reply != null)
        	{
        		jwt.verify(jwToken, config.getApplicationSecret(), function(err, decoded)
        		{
        			//token expired or invalid
					if (err)
					{
						sessions.deleteSession(jwToken, function(err, reply) 
						{ 
							return next(routeUtils.createError("Invalid session token", 401));
						});
					}
					else
					{
						//valid session found and retrieved
						req.session = reply;
        		
        				return next();
					}
				});

        	}
        	else
        	{
        		return next(routeUtils.createError("Invalid session token", 401));
        	}
        });
    }
    else
    {
    	//no session for request
    	return next();
    }
};

var sendHomepage = function(req, res)
{
	res.render('index',
    {
    	title: 'Bookstore App',
    	user: req.user ? req.user.username : ''
	});
};

//main routing definitions
router.use('/', tryRetrieveSession);
router.get('/', sendHomepage);
router.use(routeUtils.constants.API_BASE_ADDRESS, api);
router.use(routeUtils.constants.USERS_BASE_ADDRESS, users);

module.exports = router;

