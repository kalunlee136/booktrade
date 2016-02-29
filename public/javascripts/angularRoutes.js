app.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '',
        views:{
          'header':{templateUrl:'/partials/header.html'},
          'body':{templateUrl: 'partials/home.html', controller: 'HomeCtrl'}
        },
         resolve: {
          booksPromise: ['books', function(books){
            return books.getAllBooks();
          }]
         }
      })
      
      .state('profile',{
        url:'/profile',
        views:{
          'body':{templateUrl:'partials/profile.html',controller:'MainCtrl'}
        },
         resolve: {
          booksPromise: ['books','trades', function(books,trades){
             trades.getRequestedTrades();
             trades.getReceivedTrades();
             books.getAllUserBooks();
          }]
         }
      })

      .state('register', {
        url: '/register',
        views:{
          'header':{templateUrl:'/partials/header.html'},
          'body':{templateUrl: 'partials/register.html', controller: 'AuthCtrl'}
        }
      })
      
      .state('login', {
        url: '/login',
        views:{
          'header':{templateUrl:'/partials/header.html'},
          'body':{templateUrl: 'partials/login.html', controller: 'AuthCtrl'}
        }
      })
      
      .state('edit',{
        url:'/edit',
        views:{
          'body':{templateUrl:'partials/edit.html',controller:'AuthCtrl'}
        }
      })
      
    $urlRouterProvider.otherwise('');
}]);

