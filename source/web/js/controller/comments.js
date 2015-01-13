app.controller('CommentsCtrl', function ($scope, PostFactory, $routeParams){
	$scope.loading = true;
	$scope.newComment = {};

	PostFactory.getPost($routeParams.id).then(function(post){
		$scope.loading = false;
		$scope.title = post.name;
		$scope.comments = post.comments;
		$scope.products = post.products;		
	}, function(msg){
		alert(msg);
	})

	$scope.addComment = function(){
		$scope.comments.push($scope.newComment);
		$scope.newComment = {};
	}

});