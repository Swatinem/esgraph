module.exports = process.env._COV
  ? require('./lib-cov')
  : require('./lib');
