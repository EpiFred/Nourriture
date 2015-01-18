app.controller('FoodsCtrl', function ($scope, PostFactory, $routeParams){
	$scope.loading = true;
	$scope.newComment = {};

	PostFactory.getFood($routeParams.id).then(function(post){
		$scope.loading = false;
		$scope.food = post;
		console.log(post);
	}, function(msg){
		alert(msg);
	})
});