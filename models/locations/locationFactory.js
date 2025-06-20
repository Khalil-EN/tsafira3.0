const Location = require('./location');

function createLocationInstance(doc) {
  if (!doc) return null;
  return new Location({
    id: doc._id.toString(),
    ...doc.toObject()
  });
}

module.exports = createLocationInstance;
