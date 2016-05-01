'use strict'

var Crawler = require('crawler');
var request = require('request');


//global variables
var genres = {};
var books = {};
var defaultCredentials = {username:'admin', password: '1234' }
var authToken = null;
var crawler;
var hostName = 'localhost'
var port = 3000;
var maxCrawls = 1000;
var crawlCounter = 0;



/* crawl logic start */
/* **************** */

var queueNext = function(uri, callback)
{
	if (crawlCounter <= maxCrawls)
	{
		crawler.queue({uri: uri, skipDuplicates:true, callback: callback});
	}
	
	crawlCounter++;
};

var callbackMainPage = function(error, response, $) 
{
	if (error)
	{
		console.log(error);
		
		return;
	}
	console.log('crawling ' +  response.request.uri.href);
	
	$('a').each(function(index, a)
	{
		 var nextUri = $(a).attr('href');
		 
		 if (nextUri && nextUri.search(/\/category_number\//) != -1)
		 {
		 	queueNext(nextUri, callbackCategoryPage);
         }
	});
};

var callbackCategoryPage = function(error, response, $) 
{
	if (error)
	{
		console.log(error);
		
		return;
	}
	console.log('crawling ' +  response.request.uri.href);
	var category = {};
	
	var categoryMatch = response.request.uri.href.match(/\/category_number\/(\d+)/);
	
	if (categoryMatch == null)
	{
		console.log('page title not good for category: ' + $('title'));
		return;
	}
	
	category.name = $('.top_block h2').text();
	
	genres[category.name] = category;
	
	$('a').each(function(index, a)
	{
		var nextUri = $(a).attr('href');
		
		if (nextUri)
		{
			if (nextUri.search(/\/category_number\//) != -1)
			{
				queueNext(nextUri, callbackCategoryPage);
			}
			else
			{
				var bookMatch = nextUri.match(/\/book_number\/(\d+)/);
				if (bookMatch)
				{
					var book = {};
					book.id = bookMatch[1];
					book.category = category;
					books[book.id] = book;
					queueNext(nextUri, callbackBookPage);
				}
			}
		}
	});
};


var callbackBookPage = function(error, response, $) 
{
	if (error)
	{
		console.log(error);
		
		return;
	}
	
	console.log('crawling ' +  response.request.uri.href);
	
	var bookMatch = response.request.uri.href.match(/\/book_number\/(\d+)/);

	if (bookMatch == null)
	{
		console.log('page title not good for book: ' + $('title'));
		return;
	}
	var bookId = bookMatch[1]
	
	if (!(books.hasOwnProperty(bookId)))
	{
		console.log('book with id ' + bookId + ' not found in list');
		return;
	}
	
	//get name and description
	$('.desc h1').each(function(index, element) { if ($(element).attr('class') === 'title') { books[bookId].name = $(element).text();}});
	$('div[id="summary"]').find('p > b').each(function(index, element) { books[bookId].description = $(element).text();});
};

/* crawl logic end */
/* **************** */





/* server operations start */
/* **************** */

var makeServerRequest = function(path, body, method, jwtToken, callback)
{
	
	var options =
	 {
		url: 'http://' + hostName + ':' + port + path,
		method: method,
		headers: {
		'User-Agent': 'request'
	  }
	};
	
	if (body)
	{
		options.json = true;
		options.body = body; 
	}
	if (jwtToken)
	{
		options.headers = {};
		options.headers.Authorization = 'Bearer ' +  jwtToken;
	}
	
    request(options, callback);
};

var login = function(callback)
{
	makeServerRequest('/users/login', defaultCredentials, 'POST', null, function (error, response, body)
	{
		if (error)
		{
			return callback(error);	
		}
		else
		{
			if (!body.token)
			{
				return callback(new Error("no token in body: " + JSON.stringify(body)));
			}
			else
			{
				authToken = body.token;
				return callback(null);
			}
		}
		
	});
};

//we need all the genre IDS, so we can send them when inserting books
var getGenreIds = function()
{
	makeServerRequest('/api/genres', null, 'GET', authToken, function (error, response, body)
	{
		if(error || response.statusCode !== 200)
		{ 
			console.log('problem geting genre ids: ' + error);
		}
		else
		{
			var res = JSON.parse(response.body);
			
			for (var idx in res)
			{  
				if (genres[res[idx].name])
				{
					genres[res[idx].name].id = res[idx]._id;
				}
			}
		}
	});
};

var saveGenre = function(genreName)
{
	makeServerRequest('/api/genres', genres[genreName], 'POST', authToken, function (error, response, body)
	{
		if(error || response.statusCode !== 200)
		{ 
			var responseBody = JSON.stringify(body);
			if (responseBody && (responseBody.search(/duplicate key error/) != -1))
			{
				console.log('genre ' + genres[genreName].name + ' already exists, skipping...');
			}
			else
			{
				if (!error)
				{
					error = new Error('request failed(' + response.statusCode + '): ' + JSON.stringify(response.body));
				}
				
				console.log(error);
			}
			
			genres[genreName].id = null;
		}
		else
		{
			genres[genreName].finishedSaveOp = true;
			genres[genreName].id = response.body;
			console.log('inserted genre ' + genres[genreName].name + ' successfuly');
		}
	});
};


//continouously check if all genre save operations finished - genres must be inserted before books
var waitForGenreActionsToFinish = function(callback)
{
	setTimeout(function()
	{
		for (var genreName in genres)
		{
			//as long as id field in all genres is not filled - we can't move on to insert books
			 if ((genres[genreName].id === undefined) || (genres[genreName].id === null) )
			 {
				return waitForGenreActionsToFinish(callback);
			 }
		}
 		
 		return callback();
	}, 5000);
};

var saveBook = function(bookId)
{
	makeServerRequest('/api/books', books[bookId], 'POST', authToken, function (error, response, body)
	{
		if(error || response.statusCode !== 200)
		{ 
			var responseBody = JSON.stringify(body);
			if (responseBody && (responseBody.search(/duplicate key error/) != -1))
			{
				console.log('book ' + books[bookId].name + ' already exists, skipping...');
			}
			else
			{
				if (!error)
				{
					error = new Error('request failed(' + response.statusCode + '): ' + JSON.stringify(response.body));
				}
				
				console.log(error);
			}
		}
		else
		{
			console.log('inserted book ' + books[bookId].name + ' successfuly');
		}
	});
};

/* server operations end */
/* ***************** */





var onFinishedCrawl = function() 
{
	console.log('\n\n\n*************  starting  Server requests  ****************!!');
	
	login(function(err)
	{
		if (err)
		{
			console.log('login failure: ' + err);
			process.exit();
		}
		else
		{
			console.log('login successful');
		
			for (var genreName in genres)
			{ 
				saveGenre(genreName);
			}
			// we didn't get IDs of the genres that were already in the database, in the previous action
			getGenreIds(); 

			waitForGenreActionsToFinish(function()
			{
				for (var bookId in books)
				{ 
					if (books[bookId].name && books[bookId].description)
					{
					
						books[bookId].genre = genres[books[bookId].category.name].id;
						delete books[bookId].id;
						delete books[bookId].category;
					
						saveBook(bookId);
					}
				}
			});
		}
	});
};


var main = function()
{
	crawler = new Crawler(
	{
		maxConnections : 20,
		skipDuplicates: true,
		callback : callbackMainPage,
		onDrain:  onFinishedCrawl
	});
	
	crawler.queue('https://www.bookbrowse.com/category/index.cfm/tc/tags');
}



main();


    
    