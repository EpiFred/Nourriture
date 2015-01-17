var app = angular.module('MonApp', ['ngRoute']);
app.config(function($routeProvider){
	$routeProvider
	.when('/', {templateUrl: 'partials/home.html'})
	.when('/search', {templateUrl: 'partials/search.html', controller: 'PostsCtrl'})
	.when('/recipes/:id', {templateUrl: 'partials/recipe.html', controller: 'RecipesCtrl'})
	.when('/foods/:id', {templateUrl: 'partials/food.html', controller: 'FoodsCtrl'})
	.when('/users/:id', {templateUrl: 'partials/user.html', controller: 'UsersCtrl'})
	.otherwise({redirectTo : '/'});
});