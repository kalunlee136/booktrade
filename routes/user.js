var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});
var AllBooks = require('../models/AllBooks');
var User = require('../models/Users')


module.exports = function(app){
  
  app.post('/api/user/books',auth, function(req,res,next){
    var newBook = new AllBooks(req.body);
    newBook.save(function(err,book){
      console.log(book);
      if(err) next(err);
        res.json(book);
      });
    });
    
}