function getMovieApiUrl(type, pageNumber, pageLimit) {
	if(type===undefined || type===null){
		type = "box_office";
	}
	return "http://api.rottentomatoes.com/api/public/v1.0/lists/movies/"+type+".json?page="+pageNumber+"&page_limit="+pageLimit+"&apikey=aw7hfa9sa85uzvuumd8p5teb&callback=?";
}
function getDvdApiUrl(type, pageNumber, pageLimit) {
	if(type===undefined || type===null){
		type = "top_rentals";
	}
	return "http://api.rottentomatoes.com/api/public/v1.0/lists/dvds/"+type+".json?page="+pageNumber+"&page_limit="+pageLimit+"&apikey=aw7hfa9sa85uzvuumd8p5teb&callback=?";
}
function getApiUrl(type, category, pageNumber, pageLimit){
	if(pageNumber === undefined){
		pageNumber = 1;
	}
	if(pageLimit===undefined){
		pageLimit = 10;
	}
	if(category === "movies"){
		return getMovieApiUrl(type, pageNumber, pageLimit);
	}else if(category === "dvds"){
		return getDvdApiUrl(type, pageNumber, pageLimit);
	}else{
		return undefined;
	}
}
function requestJson(collection, view, callback, type, category, clear, inputUrl){
	if(clear === undefined){
		clear = true;
	}
	if(navigator.onLine){
		if(inputUrl===undefined){
			inputUrl = getApiUrl(type,category, collection.loadedPages);
		}
		var req = $.ajax({
			url : inputUrl,
			dataType : "jsonp",
			timeout : 20000
		});
		req.success(function(data){
			callback(collection, view, true, data, type, category,clear);
		});
		req.error(function() {
			callback(collection, view, false, null, type, category,clear);
		});
	}else{
		callback(collection, view, false, null, type, category,clear);
	}
}
function fixImageLink(origImageLink){
	if(origImageLink.indexOf("poster_default") !== -1){
		return "img/poster_not_found.jpg";
	}else{
		return origImageLink;
	}
}
function fixDate(originalDate) {
	if(originalDate !== undefined){
		return originalDate;
	}else{
		return "TBA";
	}
}
function initialResponse(collection, view, success, data, type, category, clear){
	if(success){
		onlineResponse(collection,view,type, category, data, clear);
	}else{
		offlineResponse(collection, view, type, category);//TODO: add autopager functionality to offline mode as well
	}
}
function shortenDescription(origDescription){
	var endCharIndex =  origDescription.search(/[a-z][\.?!][ "]/);//Other version:
	//var endCharIndex =  origDescription.search(/[a-z]([\.\?!])(?= )/);
	if(endCharIndex === -1){
		return origDescription;
	}else{
		return origDescription.substring(0,endCharIndex + 2) + "..";
	}
}
function onlineResponse(collection,view,type, category, data, clear){
	collection.reset(data.movies);
	if(clear){
		if(data.total !== undefined){
			collection.maxArticles = data.total;
		}else{
			collection.maxArticles = -1;
		}
		localStorage.setItem(category + "_" + type, JSON.stringify(data.movies));
		view.render();
		window.scrollTo(0, 0);
	}else{
		view.renderNoClear();
	}
}
function offlineResponse(collection,view, type, category){
	var offlineData = JSON.parse(localStorage.getItem(category + "_" + type));
	_.each(offlineData, function(curMovie){
		curMovie.posters.thumbnail = "img/poster_offline.jpg"
	});
	if(offlineData !== undefined){
		collection.reset(offlineData);
		view.render();
		window.scrollTo(0, 0);
	}else{
		console.log("No local storage data found!");
	}
	return true;
}
function changeList(targetList){
	if(targetList==="Box Office"){
		updatePage("box_office","movies",true);
		return true;
	}else if(targetList==="In Theaters"){
		updatePage("in_theaters","movies",true);
		return true;
	}else if(targetList==="Opening Movies"){
		updatePage("opening","movies",true);
		return true;
	}else if(targetList==="Upcoming Movies"){
		updatePage("upcoming","movies",true);
		return true;
	}else if(targetList==="Top Rentals"){
		updatePage("top_rentals","dvds",true);
		return true;
	}else if(targetList==="Current Release DVDs"){
		updatePage("current_releases","dvds",true);
		return true;
	}else if(targetList==="New Release DVDs"){
		updatePage("new_releases","dvds",true);
		return true;
	}else if(targetList==="Upcoming DVDs"){
		updatePage("upcoming","dvds",true);
		return true;
	}else{
		console.log("Illegal command.");
		return false;
	}

}
function init() 
{
	Backbone.sync = function(method, model, success, error){
		success();
	}
	var Movie = Backbone.Model.extend({
		// idAttribute: 'id',
		// defaults: {
			// title : "No Title Found",
			// mpaa_rating : "N/A",
			// synopsis: "No description found.",
			// links: {alternate: "javascript:void(0)"},
			// posters: {
				// thumbnail: "img/poster_not_found.jpg"
			// },
			// release_dates: {
				// theater: "TBA",
				// dvd: "TBA"
			// }
		// }
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
			this.$el.append(this.template(this.model.toJSON()));
			return this;
		}
	});
	var MoviesListView = Backbone.View.extend({
		el: "#container",
		initialize: function(){
			_.bindAll(this,'render','renderMovieView','renderNoClear');
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
		renderNoClear: function(){
			var self = this;
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
	movies.loadedPages = 1;
	movies.maxArticles = 1;
	movies.type = "box_office";
	movies.category = "movies";
	var moviesListView = new MoviesListView({
		collection: movies
	});
	updatePage = function(type, category, clear){
		movies.type = type;
		movies.category = category;
		requestJson(movies,moviesListView,initialResponse,type, category, clear);
		return true;
	}
	changeList("Box Office");
	$(window).scroll(function() {
		if($(window).scrollTop() + $(window).height() === $(document).height()) {
			if(movies.loadedPages*10 < movies.maxArticles){
				movies.loadedPages++;
				updatePage(movies.type,movies.category,false);
			}
		}
	});
}