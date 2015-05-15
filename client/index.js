Handlebars.registerHelper('Session', function(name) {
	return Session.get(name);
});

Handlebars.registerHelper('findAll', function(name, author) {
	var filter = {};
	if(author && typeof author === 'string') {
		filter.author = author;
	}
	if(Meteor.isClient && globalCollections && globalCollections[name] && globalCollections[name].find) {
		return globalCollections[name].find(filter);
	}
});

Template.tweet.helpers({
	flaggedText: function() {
		var text = this.text;
		text = text.replace(/(\s|^)(you.re|your|yore|their|they.re|there|theirs|they.res|you.res|theres)(\s|$)/gi, '$1<strong>$2</strong>$3');
		return text;
	}
});

Template.tweet.events({
	'click .train-bad': function () {
		this.ok = false;
		Tweets.remove(this._id);
		Training.insert(this);
	},
	'click .train-good': function () {
		this.ok = true;
		Tweets.remove(this._id);
		Training.insert(this);
	},
	'click .train-remove': function () {
		Tweets.remove(this._id);
	}
});

Template.display.rendered = function() {
	$(window).on('keydown', function(e) {
		if(e.which === 27) {
			$('.tweet:first .train-remove').trigger('click');
		}
		if(e.which === 37) {
			$('.tweet:first .train-good').trigger('click');
		}
		if(e.which === 39) {
			$('.tweet:first .train-bad').trigger('click');
		}
	});
};