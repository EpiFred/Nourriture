app.controller('UsersCtrl', function ($scope, PostFactory, $routeParams){
	$scope.loading = true;
	$scope.newComment = {};

	PostFactory.getUser($routeParams.id).then(function(post){
		$scope.loading = false;
		$scope.user = post;
		console.log(post);
	}, function(msg){
		alert(msg);
	})
});