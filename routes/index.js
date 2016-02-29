//var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});
var AllBooks = require('../models/AllBooks');
var User = require('../models/Users');
var Trades = require('../models/Trades');


module.exports = function(app){
    /* GET home page. */
    app.get('/', function(req, res, next) {
      res.render('index');
    });
    
    app.get('/api/books',function(req,res,next){
      AllBooks.find(function(err,books){
        if(err) next(err);
        
        res.json(books);
      })  
    });
    
    //get all of current user's trade requests
    app.get('/api/trades/requests', auth, function(req,res,next){
      Trades.find({'requester_id':req.payload._id} , function(err,trades){
        res.json(trades);
      });
    });
    
    //get all of current user's received requests
    app.get('/api/trades/received', auth, function(req,res,next){
      Trades.find({'owner_id':req.payload._id},function(err,trades){
        res.json(trades);
      })
    });
    
    //user can send trade requests
    app.post('/api/trades/requests',auth, function(req,res,next){
      //add trade request to current user's trade queue
        /*User.findById(req.body.requester_id, function(err, user){
          user.requests.push(req.body);
          user.save(function(err,user){
            if(err) console.log(err);
            //console.log('add to requests', user);
          })
        });
        
        //then add the request to book owner's pending list
        User.findById(req.body.owner_id, function(err, user){
          user.received.push(req.body);
          user.save(function(err,u){
            if(err) console.log(err);
            //console.log('add to pending',u);
          })
        });*/
        var trade = new Trades(req.body);
        trade.save(function(err,t){
          if(err) console.log(err);
          
          console.log('post /api/trades/requests', t)
          res.json(t);
        })
      
    });
    
    app.post('/api/trades/accepted', auth, function(req,res,next){
        console.log('accept trade', req.body);
        AllBooks.findOne({'_id':req.body.book_id},function(err,book){
          console.log('before change /api/trades/accepted', book);
          book.owner_id = req.body.requester_id;
          book.save(function(err,book){
            console.log('post /api/trades/accepted', book);
          });
        });
        
        Trades.findByIdAndRemove(req.body._id, function(err){
          if(err) console.log(err);
        });
        
    });
    
    //get all of an owner's books
    app.get('/api/allbooks/books', auth, function(req,res,next){
     AllBooks.find({'owner_id':req.payload._id}, function(err, books){
        res.json(books);
      });
    });
    
    //add a book to the list of all books.
    app.post('/api/allbooks/books',auth, function(req,res,next){
      var newBook = new AllBooks(req.body);
      newBook.save(function(err,book){
        if(err) 
          console.log(err)
        
        res.json(book);
      });

    });
    
    app.put('/edit',auth, function(req,res,next) {
      
      User.findById(req.payload._id, function(err, user){
        //console.log(user);
        if (req.body.fullname)
          user.fullname = req.body.fullname
        
        if (req.body.city)
          user.city = req.body.city
        
        if (req.body.state)
          user.state = req.body.state
          
        if (req.body.password)
          user.setPassword(req.body.password)
          
        user.save(function (err){
          if(err){ return next(err); }
          //console.log(user);
          return res.json({token: user.generateJWT()})
        });
        
      });
      
    });
    
    app.post('/register', function(req, res, next){
      if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
      }

      var user = new User();
    
      user.username = req.body.username;
    
      user.setPassword(req.body.password)
  
      user.save(function (err){
        if(err){ return next(err); }
    
        return res.json({token: user.generateJWT()})
      });
    });
    
    app.post('/login', function(req, res, next){
      if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
      }
    
      passport.authenticate('local', function(err, user, info){
        if(err){ return next(err); }
    
        if(user){
          return res.json({token: user.generateJWT()});
        } else {
          return res.status(401).json(info);
        }
      })(req, res, next);
    });
}

