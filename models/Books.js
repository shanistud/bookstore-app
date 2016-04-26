var mongoose = require('mongoose');
var GenreModel = mongoose.model('Genre');

var BookSchema = new mongoose.Schema({
  name: { type: String, index: true, unique: true},
  description: String,
  genre: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }
}, 
{ versionKey: false });

var GenreModel = mongoose.model('Genre');
//validation to make sure ref to genre is valid before saving doc
BookSchema.pre('save', function (next) 
{
    if (!this.genre)
    {
    console.log("no genre");
    console.log(this.genre);
    console.log("   bla");
    	next();
    }
    else
    {
      console.log("yes genre");
    console.log(this.genre);
    console.log("   bla");
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