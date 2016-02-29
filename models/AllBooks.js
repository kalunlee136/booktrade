var mongoose = require('mongoose');

var AllBooksSchema = new mongoose.Schema({
  title: String,
  img: String,
  owner_id:String
});

module.exports = mongoose.model('AllBooks', AllBooksSchema);

