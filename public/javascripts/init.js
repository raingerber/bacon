$(function() {
	
	var SearchBox = new Backbone.View.extend({
		initialize: function() {
			console.log('initialize');
			this.render();
		},
		render: function() {
			console.log('render');
			this.$el.html('<div>hello</div>');
		}
	});
	
	var actor_search = new SearchBox({
		el: $('#search_template')
	});
	
	//search_template
	
});

/*

you make my dreams come true


*/