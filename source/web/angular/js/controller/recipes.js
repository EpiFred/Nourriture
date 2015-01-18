app.controller('RecipesCtrl', function ($scope, PostFactory, $routeParams){
	$scope.loading = true;
	$scope.newComment = {};

	PostFactory.getRecipe($routeParams.id).then(function(post){
		$scope.loading = false;
		$scope.recipe = post;
		$scope.foods = post.foods;
		$scope.comments = post.comments;
	}, function(msg){
		alert(msg);
	})

	$scope.addComment = function(){
		$scope.comments.push($scope.newComment);
		$scope.newComment = {};
	}

});