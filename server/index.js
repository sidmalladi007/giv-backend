let express = require('express');
let app = express();
let logger = require('morgan');
let config = require('./config/main');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');

let server = app.listen(config.port);
console.log('Your server is running on port ' + config.port + '.');

mongoose.connect(config.database);

app.use(logger('dev'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const router = require('./router');

router(app);
