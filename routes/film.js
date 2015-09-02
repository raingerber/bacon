var express = require('express');
var router = express.Router();

var m = "MATCH (actor:Actor) WHERE actor.first_name =~ 'A.*' RETURN actor";
//MATCH (actor:Actor) WITH actor.first_name + ' ' + actor.last_name AS name, actor.sex AS sex WHERE name =~ '.*nn.*' RETURN name, sex

// get
router.get('/', function(req, res, next) {
	console.log('film: get');
	res.json({get: true});
});

// create
router.post('/', function(req, res, next) {
	console.log('film: create');
	res.json({create: true});
});

// update
router.put('/', function(req, res, next) {
	console.log('film: update');
	res.json({update: true});
});

module.exports = router;
