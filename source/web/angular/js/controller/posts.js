app.controller('PostsCtrl', function ($scope, PostFactory){
	$scope.loading = true;
	$scope.posts = PostFactory.getPosts().then(function(posts){
		$scope.loading = false;
		$scope.posts = posts;
		$scope.recipes = posts.recipes;
		$scope.users = posts.users;
		$scope.foods = posts.foods;
	}, function(msg){
		alert(msg);
	})
});