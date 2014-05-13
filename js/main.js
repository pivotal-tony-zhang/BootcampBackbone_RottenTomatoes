function getApiUrl(type) {
	return "http://api.rottentomatoes.com/api/public/v1.0/lists/movies/"+type+".json?apikey=aw7hfa9sa85uzvuumd8p5teb&callback=?";
}

function requestJson(collection, view, callback,inputUrl){
	if(navigator.onLine){
		if(inputUrl===undefined || inputUrl===null){
			inputUrl = getApiUrl("box_office");
		}
		var req = $.ajax({
			url : inputUrl,
			dataType : "jsonp",
			timeout : 5000
		});
		req.success(function(data){
			callback(collection, view, data);
		});
		req.error(function() {
			callback(collection, view, null);
		});
	}else{
		callback(collection, view, null);
	}
}

function initialResponse(collection, view, data){
	if(data===null){
		offlineResponse(collection,view);
	}else{
		onlineResponse(collection,view,data);
	}
}

function offlineResponse(collection,view){

}

function changeList(targetList){
	if(targetList==="Box Office"){
		return true;
	}else if(targetList==="In Theaters"){
	updateCollection
		return true;
	}else if(targetList==="Opening Movies"){
		return true;
	}else if(targetList==="Upcoming Movies"){
		return true;
	}else{
		console.log("Illegal command.");
		return false;
	}

}

function onlineResponse(collection,view,data){
	collection.add(data.movies);
	view.render();
}

function init() 
{
	
	Backbone.sync = function(method, model, success, error){
		success();
	}
	var Movie = Backbone.Model.extend({
		idAttribute: 'id',
		defaults: {
			title : "No Title found",
			mpaa_rating : "N/A"
			// posters: {
				// thumbnail: INSERT NO THUMBNAIL FOUND HERE!!!!!!!!!!!!!!!!!!!!!!!!
			// }
		}
	});
	var Movies = Backbone.Collection.extend({
		model: Movie
	});
	var MovieView = Backbone.View.extend({
		className: "movie",
		template: _.template($("#movie-template").html()),
		render: function(){
			this.$el.empty();
			this.$el.append(this.template(this.model.toJSON()));
		}
	});
	var MoviesListView = Backbone.View.extend({
		el: "#container",
		renderMovieView: function(movie) {
			var movieView = new MovieView({
				model: movie
			});
			this.$el.append(movieView.el);
			movieView.render();
		},
		render: function(){
			var self = this;
			_.each(this.collection.models, function (movie) {
				self.renderMovieView(movie);
			});
		}
	});
	var movies = new Movies();
	var moviesListView = new MoviesListView({
		collection: movies
	});
	u = function(){
	console.log(moviesListView);
	console.log(movies);
	moviesListView.render();
	}
	requestJson(movies, moviesListView,initialResponse);
}