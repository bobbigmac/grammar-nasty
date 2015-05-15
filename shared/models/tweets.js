globalCollections = {}; //allows findAll template helper in global scope

Training = new Mongo.Collection('training');
Tweets = new Mongo.Collection('tweets');

globalCollections['training'] = Training;
globalCollections['tweets'] = Tweets;

if(Meteor.isServer) {
	var cleanTweets = function() {
		var now = (new Date()).getTime();

		var removed = Tweets.remove({ added: { $lt: now - 360000 }});
		console.log(removed, 'tweets removed');
	};
	cleanTweets();
	Meteor.setInterval(cleanTweets, 360000);

	Meteor.publish('training', function() {
		return Training.find();
	});

	Meteor.publish('candidates', function() {
		return Tweets.find({}, {
			sort: {
				added: 1
			},
			limit: 100
		});
	});
}

if(Meteor.isClient) {
	Meteor.subscribe('candidates');
	Meteor.subscribe('training');
}