function getMovieApiUrl(type) {
	if(type===undefined || type===null){
		type = "box_office";
	}
	return "http://api.rottentomatoes.com/api/public/v1.0/lists/movies/"+type+".json?apikey=aw7hfa9sa85uzvuumd8p5teb&callback=?";
}

function getDvdApiUrl(type) {
	if(type===undefined || type===null){
		type = "top_rentals";
	}
	return "http://api.rottentomatoes.com/api/public/v1.0/lists/dvds/"+type+".json?apikey=aw7hfa9sa85uzvuumd8p5teb&callback=?";
}

function requestJson(collection, view, callback,inputUrl){
	if(navigator.onLine){
		if(inputUrl===undefined || inputUrl===null){
			inputUrl = getMovieApiUrl();
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
		updatePage("box_office","movies");
		return true;
	}else if(targetList==="In Theaters"){
		updatePage("in_theaters","movies");
		return true;
	}else if(targetList==="Opening Movies"){
		updatePage("opening","movies");
		return true;
	}else if(targetList==="Upcoming Movies"){
		updatePage("upcoming","movies");
		return true;
	}else{
		console.log("Illegal command.");
		return false;
	}

}

function onlineResponse(collection,view,data){
	collection.reset(data.movies);
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
		initialize: function() {
			this.model.on('change',this.render,this);
		},
		render: function(){
			// this.$el.empty();
			this.$el.append(this.template(this.model.toJSON()));
			return this;
		}
	});
	var MoviesListView = Backbone.View.extend({
		el: "#container",
		initialize: function(){
			_.bindAll(this,'render','renderMovieView');
            if(this.model) {
				this.model.on('change',this.render,this);
            }
		},
		render: function(){
			var self = this;
			this.$el.empty();
			this.collection.each(this.renderMovieView);
			return this;
		},
		renderMovieView: function(movie) {
			var movieView = new MovieView({
				model: movie
			});
			this.$el.append(movieView.render().el);
			return this;
		}
	});
	var movies = new Movies();
	var moviesListView = new MoviesListView({
		collection: movies
	});
	updatePage = function(newType, category){
		if(category==="movies"){
			requestJson(movies,moviesListView,initialResponse,getMovieApiUrl(newType));
			return true;
		}else if(category==="dvds"){
			requestJson(movies,moviesListView,initialResponse,getDvdApiUrl(newType));
			return true;
		}else{
			return false;
		}
	}
	changeList("Box Office");
}