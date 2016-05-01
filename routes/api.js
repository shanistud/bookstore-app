var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var BookModel = mongoose.model('Book');
var GenreModel = mongoose.model('Genre');
var routeUtils = require('./route.utils');
var roles = require('../models/Roles');


//default authentication - no token, no api
router.use('/', function(req, res, next) 
{
  	if (!routeUtils.isAuthorized(req, true))
	{
		return next(routeUtils.createError("No auth provided", 401)); 
	}
	else
	{
		return next();
	}
});


/* redirect to home page. */
router.get('/', function(req, res, next) 
{
  res.redirect('..');
});




//parameter routing
router.param('bookId', function(req, res, next, bookId) 
{
  var query = BookModel.findById(bookId);
  query.exec(function (err, book)
  {
    if (err) 
    { 
    	return next(err); 
    }
    if (!book) 
    { 
    	
    	return next(routeUtils.createError('book not found', 404)); 
    }

    req.book = book;
    return next();
  });
});

router.param('genreId', function(req, res, next, genreId) 
{
  var query = GenreModel.findById(genreId);
  query.exec(function (err, genre)
  {
    if (err) 
    { 
    	return next(err); 
    }
    if (!genre) 
    { 
    	return next(routeUtils.createError('genre not found', 404)); 
    }

    req.genre = genre;
    return next();
  });
});


/* get all books
/ optional params:
/   q - text query 
/	page - number of page for paging
/   limit - max number of results (default 10)
*/
router.get(routeUtils.constants.BOOKS_ENDPOINT, function(req, res, next) 
{
	if (!routeUtils.isAuthorized(req, true))
	{
		return next(routeUtils.createError("Unauthorized", 401)); 
	}
	
	var MAX_RESULTS = 1000;
	var DEFAULT_RESULTS = 10;
	
	
	//TODO:validate query params
	
	var resultsLimit = (req.query.limit) ? (req.query.limit) : DEFAULT_RESULTS;
	resultsLimit = (resultsLimit <= MAX_RESULTS) ? resultsLimit : MAX_RESULTS;
	var textQuery = req.query.q;
	var queryConditions = (req.query.before) ? { createdAt: {$lte: req.query.before} } : {};
	var sortBy = '-createdAt';
	var returnedFields = {name: 1, description: 1, genre: 1, createdAt: 1};
	
	var queryOptions =
	{ 
		limit: resultsLimit, 
		populate: [{path: 'genre'}], 
		sort: sortBy
	};
	
	if (req.query.page)
	{
		queryOptions.skip = (parseInt(req.query.page) - 1) * parseInt(resultsLimit);
	}
	
	if (textQuery)
	{
		queryOptions.conditions = queryConditions;
		
		BookModel.search(textQuery, returnedFields, queryOptions, function(err, books)
		{
			if(err)
			{ 
				return next(err); 
			}
		
			res.json(books);
		});
	}
	else
	{
		BookModel.find(queryConditions, returnedFields, queryOptions, function(err, books)
		{
			if(err)
			{ 
				return next(err); 
			}
		
			//get total count of books for paging
			BookModel.count(function(err, totalCount)
			{
				var totalBooksCount;
				
				//even if not got it, still return result
				if(err)
				{ 
					console.log(err);
					totalCount = books.length;
				}
				
				res.json({results: books, totalCount: totalCount});
			});
		});
	}
});

//get a book by id
router.get(routeUtils.constants.BOOKS_ENDPOINT + '/:bookId', function(req, res, next) 
{
	if (!routeUtils.isAuthorized(req, false))
	{
		return next(routeUtils.createError("Unauthorized", 401)); 
	}
	
	if (req.session.user.role === roles.ROLE_CLIENT)
	{
		res.json(req.book.description);
	}
	else
	{
		req.book.populate('genre', function(err, book) 
		{
			if (err) 
			{ 
				return next(err); 
			}
			res.json(req.book);
		 });
	}
});


//update book
router.post(routeUtils.constants.BOOKS_ENDPOINT + '/:bookId', function(req, res, next) 
{
	if (!routeUtils.isAuthorized(req, true))
	{
		return next(routeUtils.createError("Unauthorized", 401)); 
	}
	
	//todo: body object validation
	var objectChanged = false;
	if (req.body.hasOwnProperty("name"))
	{
		req.book.name = req.body.name;
		objectChanged = true;
	}
	if (req.body.hasOwnProperty("description"))
	{
		req.book.description = req.body.description;
		objectChanged = true;
	}
	if (req.body.hasOwnProperty("genre"))
	{
		req.book.genre = req.body.genre;
		objectChanged = true;
	}
	if (objectChanged)
	{
		req.book.save(function(err, book)
 		{		
    		if(err)
   			{ 
    			return next(err); 
    		}
    		
    		res.json(req.book);
    	});
  	}
  	else
  	{
  		res.json(req.book);
  	}
});

//create book
router.post(routeUtils.constants.BOOKS_ENDPOINT, function(req, res, next) 
{
	if (!routeUtils.isAuthorized(req, true))
	{
		return next(routeUtils.createError("Unauthorized", 401)); 
	}
	
	var book = new BookModel(req.body);
	book.save(function(err, book)
	{
		if(err)
		{ 
			return next(err); 
		}

		res.json(book);
	});
});

//delete book
router.delete(routeUtils.constants.BOOKS_ENDPOINT + '/:bookId', function(req, res, next) 
{
	if (!routeUtils.isAuthorized(req, true))
	{
		return next(routeUtils.createError("Unauthorized", 401)); 
	}
	
	req.book.remove(function(err, book)
	{
		if (err)
		{
			return next(err); 
		}
		res.sendStatus(200);
	});
});


//get all books by genre
router.get(routeUtils.constants.BOOKS_ENDPOINT + 'by_genre/:genreId', function(req, res, next) 
{
	if (!routeUtils.isAuthorized(req, false))
	{
		return next(routeUtils.createError("Unauthorized", 401)); 
	}
	
	BookModel.find({genre: req.params.genreId}, function(err, books)
	{
	if(err)
	{ 
		return next(err); 
	}
	res.json(books);
	});
});


//get all genres
router.get(routeUtils.constants.GENRES_ENDPOINT, function(req, res, next) 
{
	if (!routeUtils.isAuthorized(req, false))
	{
		return next(routeUtils.createError("Unauthorized", 401)); 
	}
	
	GenreModel.find(function(err, genres)
	{
	if(err)
	{ 
		return next(err); 
	}
	
	res.json(genres);
	});
});


//get genre
router.get(routeUtils.constants.GENRES_ENDPOINT + '/:genreId', function(req, res, next) 
{
	if (!routeUtils.isAuthorized(req, true))
	{
		return next(routeUtils.createError("Unauthorized", 401)); 
	}
	
	res.json(req.genre);
});

//update genre
router.post(routeUtils.constants.GENRES_ENDPOINT + '/:genreId', function(req, res, next) 
{
	if (!routeUtils.isAuthorized(req, true))
	{
		return next(routeUtils.createError("Unauthorized", 401)); 
	}
	
	//todo: body object validation
	var objectChanged = false;
	if (req.body.hasOwnProperty("name"))
	{
		req.genre.name = req.body.name;
		objectChanged = true;
	}
	
	if (objectChanged)
	{
		req.genre.save(function(err, book)
 		{		
    		if(err)
   			{ 
    			return next(err); 
    		}
    		
    		res.json(req.genre);
    	});
  	}
  	else
  	{
  		res.json(req.genre);
  	}
});

//delete genre
router.delete(routeUtils.constants.GENRES_ENDPOINT + '/:genreId', function(req, res, next) 
{
	if (!routeUtils.isAuthorized(req, true))
	{
		return next(routeUtils.createError("Unauthorized", 401)); 
	}
	
	req.genre.remove(function(err, genre)
	{
		if (err)
		{
			return next(err); 
		}
		
		//update all books with that genre
		BookModel.update({genre: req.params.genreId}, {$set:{genre: null }},
		 { multi: true }, function(err,model)
	   	{
	   		if(err)
    		{ 
    			return next(err); 
    		}
    		
    		res.sendStatus(200);
    	});
	});
});

//create genre
router.post(routeUtils.constants.GENRES_ENDPOINT, function(req, res, next) 
{
	if (!routeUtils.isAuthorized(req, true))
	{
		return next(routeUtils.createError("Unauthorized", 401)); 
	}
	
	var genre = new GenreModel(req.body);
	genre.save(function(err, genre)
	{
	if(err)
	{ 
		return next(err); 
	}
	res.json(genre);
  });
});



module.exports = router;