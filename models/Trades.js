var mongoose = require('mongoose');

var AllBooksSchema = new mongoose.Schema({
  book_id:String,
  requester_id: String,
  owner_id: String,
  img: String,
  title: String
});

module.exports = mongoose.model('Trades', AllBooksSchema);

