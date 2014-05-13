function getApiUrl() {
	return "http://api.rottentomatoes.com/api/public/v1.0/lists/movies/box_office.json?apikey=aw7hfa9sa85uzvuumd8p5teb&callback=?";
}

function requestJson(view,collection,inputUrl){
	if(navigator.onLine){
		if(inputUrl===undefined || inputUrl===null){
			inputUrl = getApiUrl();
		}
		var req = $.ajax({
			url : inputUrl,
			dataType : "jsonp",
			timeout : 5000
		});
		req.success(function(data){
			onlineResponse(view,collection,data);
		});
		req.error(function() {
			offlineResponse(view,collection);
		});
	}else{
		offlineResponse();
	}
}

function offlineResponse(view,collection){

}

function onlineResponse(view,collection,data){
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
		// events: {
			// "click span.viewDescription" : "viewDescription",
			// "click span.delete" : "remove"
		// },
		// initialize: function(){
			// _.bindAll(this, 'render', 'unrender', 'viewDescription', 'remove'); 
			// this.model.bind('change', this.render);
			// this.model.bind('remove', this.unrender);
		// },
		render: function(){
			this.$el.empty();
			this.$el.append(this.template(this.model.toJSON()));
			// $(this.el).html('<span style="color:black;">'+this.model.get('name')+' '+this.model.get('price')+'</span> &nbsp; &nbsp; <span class="viewDescription" style="font-family:sans-serif; color:blue; cursor:pointer;">[View Description]</span> <span class="delete" style="cursor:pointer; color:red; font-family:sans-serif;">[delete]</span>');
			// return this;
		}
		// unrender: function(){
			// $(this.el).remove();
		// },
		// viewDescription: function(){
			
		// },
		// remove: function(){
			// this.model.destroy();
		// }
	});
	var MoviesListView = Backbone.View.extend({
		el: "#container",
		// events: {
			// 'click button#add': 'addItem'
		// },
		// initialize: function(){
			// _.bindAll(this, 'render', 'addItem', 'appendItem');
			// this.collection = new Products();
			// this.collection.bind('add', this.appendItem);
			// this.counter = 0;
			// this.render();
		// },
		renderMovieView: function(movie) {
			var movieView = new MovieView({
				model: movie
			});
			this.$el.append(movieView.el);
			movieView.render();
		},
		render: function(){
			var self = this;
			// $(this.el).append("<button id='add'>Add list item</button>");
			// $(this.el).append("<ul></ul>");
			// _(this.collection.models).each(function(product){
				// self.appendItem(product);
			// }, this);
			_.each(this.collection.models, function (movie) {
            // Call the renderPostView method
				self.renderMovieView(movie);
			});
		// },
		// addItem: function(){
			// this.counter++;
			// var product = new Product({price: "$" + (1000 + Math.round(Math.random()*1000))/100});
			// product.set({
				// name: product.get('name') + " " + this.counter
			// });
			// this.collection.add(product);
		// },
		// appendItem: function(product){
			// var productView = new ProductView({
				// model: product
			// });
			// $('ul', this.el).append(productView.render().el);
		// }
		}
	});
	var movies = new Movies();
	var moviesListView = new MoviesListView({
		collection: movies
	});
	requestJson(moviesListView, movies);
	// products.add(productsJson.products);
	// productsListView.render();
}