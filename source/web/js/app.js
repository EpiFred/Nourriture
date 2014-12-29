var app = angular.module('MonApp', ['ngRoute']);
app.config(function($routeProvider){
	$routeProvider
	.when('/', {templateUrl: 'partials/home.html'})
	.when('/search', {templateUrl: 'partials/search.html', controller: 'PostsCtrl'})
	.when('/comments/:id', {templateUrl: 'partials/recipe.html', controller: 'CommentsCtrl'})
	.otherwise({redirectTo : '/'});
});