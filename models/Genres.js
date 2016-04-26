var mongoose = require('mongoose');

var GenreSchema = new mongoose.Schema({
  name: { type: String, index: true, unique: true},
}, 
{ versionKey: false });

mongoose.model('Genre', GenreSchema);