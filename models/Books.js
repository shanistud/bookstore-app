var mongoose = require('mongoose');
var GenreModel = mongoose.model('Genre');
var searchPlugin = require('mongoose-search-plugin');

var BookSchema = new mongoose.Schema(
{
  name: { type: String, index: true, unique: true},
  description: String,
  genre: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }
}, 
{ versionKey: false});

BookSchema.plugin(searchPlugin, {
    fields: ['name', 'description']
  });

//validation to make sure ref to genre is valid before saving doc
BookSchema.pre('save', function (next) 
{
    if (!this.genre)
    {
    	next();
    }
    else
    {
    	GenreModel.findById(this.genre, function (err, existingGenre) 
    	{
    		if (existingGenre)
       		{
       			next();
       	 	}
        	else
        	{
        		next(new Error("genre doesn\'t exist" + this.genre));
        	}
        });
    }
});

mongoose.model('Book', BookSchema);