module.exports = process.env.ESGRAPH_COV
  ? require('./lib-cov')
  : require('./lib');
