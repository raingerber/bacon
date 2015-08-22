var express = require('express');
var router = express.Router();

var cons = require('consolidate');

/* GET home page. */
router.get('/', function(req, res, next) {
	//res.render('index', { title: 'crass' });
	console.log('send it');
	cons.hogan('views/index.hjs', {
		title: 'bunny'
	}, function(err, html) {
		console.log('send it 2');
		res.send(html);
	});
});

module.exports = router;
