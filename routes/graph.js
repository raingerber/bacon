var express = require('express');
var router = express.Router();

var neo4j = require('node-neo4j');
var db = new neo4j('http://neo4j:pw@localhost:7474');

router.get('/hello', function(req, res, next) {
	
	res.json({name: 'Billy'});

});

router.get('/hello2', function(req, res, next) {
	
	res.json({name: 'Billy'});
	
	var query = "MATCH (actor:Actor {last_name: 'Akita'})-[r:ACTS_IN]->(film:Film) WITH actor, COLLECT(film) AS films RETURN actor, films";

	//query = "http://localhost:7474/db/data/node/31746/properties";
	
	db.cypherQuery(query, function(err, result) {
		
		if (err) throw err;

		//console.log(result); // delivers an array of query results

		//console.log(result.columns); // delivers an array of names of objects getting returned
		
		console.log(JSON.stringify(result, null, 2));
		
		res.json(result);
		
	});
	
});

module.exports = router;
