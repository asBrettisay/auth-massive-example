angular.module('app', ['ui.router', 'ngRoute'])
.config(function($urlRouterProvider, $stateProvider) {
  $urlRouterProvider.otherwise('/')

  $stateProvider
    .state('home', {
      url: '/',
      controller: 'homeController',
      templateUrl: './views/home.html'
    })
})
