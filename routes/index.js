var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var BookModel = mongoose.model('Book');
var GenreModel = mongoose.model('Genre');



/* GET home page. */
router.get('/', function(req, res, next) 
{
  res.render('index', { title: 'Express' });
});

module.exports = router;


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
    	return next(new Error('book not found')); 
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
    	return next(new Error('genre not found')); 
    }

    req.genre = genre;
    return next();
  });
});


//get all books
router.get('/books', function(req, res, next) 
{
  BookModel.find().populate('genre').exec(function(err, books)
  {
    if(err)
    { 
    	return next(err); 
    }
    res.json(books);
  });
});

//get a book by id
router.get('/books/:bookId', function(req, res, next) 
{
	req.book.populate('genre', function(err, book) 
	{
		if (err) 
   	 	{ 
   	 		return next(err); 
   	 	}
   	 	res.json(req.book);
   	 });
});


//update book
router.post('/books/:bookId', function(req, res, next) 
{
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
	
		//todo: make sure genre object exists
		// GenreModel.find({id: req.body.genre}, (function(err, genreFound)
// 		{
// 			req.book.genre = req.body.genre;
// 			
// 			req.book.save(function(err, book)
//  			{		
// 				if(err)
//    				{ 
//     				return next(err); 
//     			}
//     		
//     			res.json(req.book);
//     		});
// 		}));
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
router.post('/books', function(req, res, next) 
{
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
router.delete('/books/:bookId', function(req, res, next) 
{
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
router.get('/books/by_genre/:genreId', function(req, res, next) 
{
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
router.get('/genres', function(req, res, next) 
{
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
router.get('/genres/:genreId', function(req, res, next) 
{
	res.json(req.genre);
});

//update genre
router.post('/genres/:genreId', function(req, res, next) 
{
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
router.delete('/genres/:genreId', function(req, res, next) 
{
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
router.post('/genres', function(req, res, next) 
{
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