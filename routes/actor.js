var express = require('express');
var router = express.Router();

var neo4j = require('node-neo4j');
var db = new neo4j('http://neo4j:pw@localhost:7474');
var _ = require('lodash');

var actor_search = _.template("MATCH (actor:Actor) WITH actor.first_name + ' ' + actor.last_name AS name, actor.sex AS sex WHERE name =~ '(?i).*<%= query %>.*' RETURN name, sex")

// get
router.get('/actor', function(req, res, next) {
	
	console.log('GET');
	
	console.log(actor_search(req.query));
	
	db.cypherQuery(actor_search(req.query), function(err, result) {
		
		if (err) {
			console.log('error happened');
			return res.json({error: 'error'});
			//throw err;
		}
		
		var data = _.map(result.data, _.partial(_.zipObject, result.columns));	
		
		//console.log(JSON.stringify(result, null, 2));
		
		res.json(data);
		
	});
	
});

// create
router.post('/actor', function(req, res, next) {
	console.log('POST');
});

// update
router.put('/actor', function(req, res, next) {
	console.log('PUT');
});

module.exports = router;
