var express = require('express');
var controller = require('./controller.js');
var router = express.Router();
var path = require('path');
var multer = require('multer');
var upload = multer({
    dest: path.join(__dirname, 'files/')
});
router.get('/',upload.single('csv'),controller);
module.exports = router;