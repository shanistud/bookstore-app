var express = require('express');
var router = express.Router();
var api = require('./api');
var users = require('./users');
var constants = require('../common/common.constants');
var app = express();


router.get('/', function(req, res)
{
    res.render('index',
    {
    	title: 'Bookstore App',
    	user: req.user ? req.user.username : ''
	});
});


module.exports = router;

router.use(constants.API_BASE_ADDRESS, api);
router.use(constants.USERS_BASE_ADDRESS, users);
