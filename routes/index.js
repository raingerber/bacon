var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	
	//res.send('HELLO');
	
	//console.log('rendering GET');
	
	res.render('index');

	//console.log('post render');
	
});

module.exports = router;
