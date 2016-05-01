var redis = require("redis");
var _redisClient = redis.createClient();    

const SESSIONS_PERFIX = 'SESSION_';

/*  session service implemented with redis  */


var _createSession = function(token, user, callback)
{
	var session = 
	{
		token: token,
		user: user,
		properties: {}
	};
	
	_redisClient.set(SESSIONS_PERFIX + token, JSON.stringify(session), function(err, reply)
	{
		callback(err, reply);
	});
};

var _retrieveSession = function(token, callback)
{
	_redisClient.get(SESSIONS_PERFIX + token, function(err, reply)
	{
		if (err)
		{
			callback(err);
		}
		else
		{
			callback(null, JSON.parse(reply));	
		}
	});
};

var _deleteSession = function(token, callback)
{
	_redisClient.get(SESSIONS_PERFIX + token, function(err, reply)
	{
		callback(err, reply);
	});
};

module.exports = 
{
	createSession: _createSession,
	retrieveSession: _retrieveSession,
	deleteSession: _deleteSession
};