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

function fixImageLink(origImageLink){
	if(origImageLink.indexOf("poster_default") !== -1){
		return "img/poster_not_found.jpg";
	}else{
		return origImageLink;
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
	return true;
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
	}else if(targetList==="Top Rentals"){
		updatePage("top_rentals","dvds");
		return true;
	}else if(targetList==="Current Release DVDs"){
		updatePage("current_releases","dvds");
		return true;
	}else if(targetList==="New Release DVDs"){
		updatePage("new_releases","dvds");
		return true;
	}else if(targetList==="Upcoming DVDs"){
		updatePage("upcoming","dvds");
		return true;
	}else{
		console.log("Illegal command.");
		return false;
	}

}

function onlineResponse(collection,view,data){
	// _.each(data.movies,function(curMovie){
		// if(curMovie.posters.thumbnail.indexOf("poster_default") !== -1){
			// curMovie.posters.thumbnail = "img/poster_not_found.jpg";
		// }
	// });
	collection.reset(data.movies);
	view.render();
	window.scrollTo(0, 0);
}

function shortenDescription(origDescription){//TODO: fix function so that it works even for initials in names
	var endCharIndex =  origDescription.search(/[a-z]([\.\?!])(?= )/);
	if(endCharIndex === -1){
		return origDescription;
	}else{
		return origDescription.substring(0,endCharIndex + 2) + "..";
	}
}

function init() 
{
	Backbone.sync = function(method, model, success, error){
		success();
	}
	var Movie = Backbone.Model.extend({
		idAttribute: 'id',
		defaults: {
			title : "No Title Found",
			mpaa_rating : "N/A",
			synopsis: "No description found.",
			posters: {
				thumbnail: "img/poster_not_found.jpg"
			}
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