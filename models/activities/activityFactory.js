const Activity = require('./BasicActivity');

function createActivityInstance(doc) {
  return new Activity(doc);
}

module.exports = createActivityInstance;
