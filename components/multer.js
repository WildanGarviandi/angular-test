var multer = require('multer');
var storage = multer.diskStorage({});
var upload = multer({storage: storage});

module.exports = upload;

