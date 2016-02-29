var app = angular.module('booktrade', ['ui.router']);

app.controller('MainCtrl', ['$scope','$http', 'auth','books', 'trades', function($scope, $http, auth, books, trades){
    $scope.isLoggedIn = auth.isLoggedIn;
    
    $scope.allbooks = books.allbooks;
    $scope.userbooks = books.userbooks;
    //$scope.bookTitle = 'Harry Potter and the Prisoner of Azkaban';
    
    $scope.requested = trades.requested;
    $scope.received = trades.received;
    
    var userinfo = auth.userInfo();
   
    var addBooks = function(obj, api_route, booklist) {
      $http.post(api_route, obj ,{headers: {Authorization: 'Bearer '+auth.getToken()}} ).then(function(data) {
        $scope.userbooks.push(data.data);
      });
    }

    $scope.search = function(){
       if ($scope.bookTitle != ''){
         var api= 'https://www.googleapis.com/books/v1/volumes?q='+ $scope.bookTitle;
        
         $http.get(api).then(function(data){
           var info = data.data.items[0].volumeInfo,
               img = info.imageLinks.thumbnail,
               owner_id = userinfo._id,
               title = info.title;
           var obj = {'title': title, 'img': img, 'owner_id':owner_id};
           console.log('obj',obj);
           addBooks(obj,'/api/allbooks/books', $scope.userbooks); //push the new book to the user's book list
           
           $scope.bookTitle = ''
         });
       }
    }
  
    $scope.acceptTrade = function(book,index){
      console.log('book',book);
      trades.acceptTrade(book,index);
    };
    
    $scope.declineTrade = function(){};
    
}]);

app.controller('HomeCtrl', ['$scope','$http', 'auth','books', 'trades', function($scope, $http, auth, books, trades){
    $scope.isLoggedIn = auth.isLoggedIn;
    
    $scope.allbooks = books.allbooks;

    var userinfo = auth.userInfo();

    $scope.requestTrade = function(book){
      trades.requestTrade(book, userinfo._id);
    };

}]);
app.controller('AuthCtrl', ['$scope','$state','auth', function($scope, $state, auth){
  $scope.user = {};
  $scope.userInfo = function(){
    auth.userInfo();  
  }
  
  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
  
  $scope.edit = function(){
    auth.edit($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
  
}]);

app.controller('NavCtrl', ['$scope','auth',function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);

app.factory('books', ['$http', 'auth', function($http, auth){
  var factory = {
     userbooks:[],
     allbooks:[]
  };
  
  factory.getAllBooks = function() {
    $http.get('/api/books').success(function(data){
      angular.copy(data, factory.allbooks);
      console.log('getAllBooks', factory.allbooks)
    });
  };
  
  factory.getAllUserBooks = function() {
    $http.get('/api/allbooks/books', {headers: {Authorization: 'Bearer '+auth.getToken()}}).success(function(data){
      angular.copy(data, factory.userbooks);
      console.log('getAllUserBooks', factory.userbooks)
    });
  };
  
  return factory;
}]);

app.factory('trades', ['$http', 'auth', function($http, auth){
  var factory = {
    requested:[],
    received:[]
  };

  factory.requestTrade = function(book, user_id){
    var obj = { 
                book_id: book._id,
                requester_id: user_id, 
                owner_id: book.owner_id, 
                img: book.img, 
                title: book.title
              };
    $http.post('/api/trades/requests', obj , {headers: {Authorization: 'Bearer '+auth.getToken()}} ).then(function(data){
      factory.requested.push(data.data);
      console.log('post /api/trades/requests',data);
    })
  };
  
  factory.getRequestedTrades = function(){
    $http.get('/api/trades/requests', {headers: {Authorization: 'Bearer '+auth.getToken()}}).then(function(data){
      angular.copy(data.data, factory.requested);
      console.log('get /api/trades/requests', data);
    })
  };
  
  factory.getReceivedTrades = function(){
    $http.get('/api/trades/received', {headers: {Authorization: 'Bearer '+auth.getToken()}}).then(function(data){
      angular.copy(data.data, factory.received);
      console.log('get getReceivedTrades', data);
    })
  };
    
  factory.acceptTrade = function(book,index){
    $http.post('/api/trades/accepted', book, {headers: {Authorization: 'Bearer '+auth.getToken()}}).then(function(data){
      console.log('post /api/trades/accepted',data);
    });
  };
  
  return factory;
}]);

app.factory('auth', ['$http', '$window', function($http, $window){
   var auth = {};
   
   auth.saveToken = function (token){
     $window.localStorage['flapper-news-token'] = token;
   };
  
   auth.getToken = function (){
     return $window.localStorage['flapper-news-token'];
   }
   
   auth.isLoggedIn = function(){
     var token = auth.getToken();
     
     if(token){
       var payload = JSON.parse($window.atob(token.split('.')[1]));
       return payload.exp > Date.now() / 1000;
     } else {
       return false;
     }
   };
   
   auth.currentUser = function(){
      if(auth.isLoggedIn()){
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));
    
        return payload.username;
      }
    };
   
   auth.userInfo = function(){
      if(auth.isLoggedIn()){
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));
    
        return payload;
      }
   }
   
   auth.register = function(user){
      return $http.post('/register', user).success(function(data){
        auth.saveToken(data.token);
      });
    };
   
   auth.edit = function(user){
      return $http.put('/edit', user, {headers: {Authorization: 'Bearer '+auth.getToken()}}).success(function(data){
        auth.saveToken(data.token);
      });
   };
    
   auth.logIn = function(user){
      return $http.post('/login', user).success(function(data){
        auth.saveToken(data.token);
      });
    };
   
   auth.logOut = function(){
      $window.localStorage.removeItem('flapper-news-token');
    };

   return auth;
}])