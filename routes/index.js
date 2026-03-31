var express = require('express');
var router = express.Router();
let path = require('path')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/chat', function(req, res, next) {
  res.sendFile(path.join(__dirname,'../resources/chat.html'))
});

module.exports = router;
