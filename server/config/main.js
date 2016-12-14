var env = require('node-env-file');
env(__dirname + '/../.env');

module.exports = {
'port': process.env.PORT || 3000,
'secret': process.env.AUTH_SECRET,
'database': process.env.DATABASE,
}
