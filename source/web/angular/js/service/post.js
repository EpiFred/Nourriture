app.factory('PostFactory', function ($http, $q, $timeout){
	var factory = {
		posts : false,
		getPosts : function(){
			var deferred = $q.defer();
			if (factory.posts !== false){
				deferred.resolve(factory.posts);
			}else{
				$http.post('http://54.193.57.157:3000/search?t=760468092aff5a9815ea4271944ca1b3')
				.success(function(data, status){
					factory.posts = data;
					$timeout(function(){
						deferred.resolve(data);
					}, 1000)
				}).error(function(data, status){
					deferred.reject('error connection');
				});
			}
			return deferred.promise;
		},
		getRecipe: function(id){
			var deferred = $q.defer();
			var post = {};
			var posts = factory.getPosts().then(function(posts){	
				angular.forEach(posts.recipes, function(value, key){
					if (value._id == id){
						post = value;
					}
				});
				deferred.resolve(post);
			}, function(msg){
				deferred.reject(msg);
			})
			return deferred.promise;
		},
		getFood: function(id){
			var deferred = $q.defer();
			var post = {};
			var posts = factory.getPosts().then(function(posts){	
				angular.forEach(posts.foods, function(value, key){
					if (value._id == id){
						post = value;
					}
				});
				deferred.resolve(post);
			}, function(msg){
				deferred.reject(msg);
			})
			return deferred.promise;
		},
		getUser: function(id){
			var deferred = $q.defer();
			var post = {};
			var posts = factory.getPosts().then(function(posts){	
				angular.forEach(posts.users, function(value, key){
					if (value._id == id){
						post = value;
					}
				});
				deferred.resolve(post);
			}, function(msg){
				deferred.reject(msg);
			})
			return deferred.promise;
		}
	};
	return factory;
})