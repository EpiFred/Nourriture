app.controller('RecipesCtrl', function ($scope, PostFactory, $routeParams){
	$scope.loading = true;
	$scope.newComment = {};

	PostFactory.getRecipe($routeParams.id).then(function(post){
		$scope.loading = false;
		$scope.recipe = post;
		$scope.foods = post.foods;
		console.log($scope.foods);		
	}, function(msg){
		alert(msg);
	})

	$scope.addComment = function(){
		$scope.comments.push($scope.newComment);
		$scope.newComment = {};
	}

});