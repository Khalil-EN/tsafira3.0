const Residence = require('./basicResidence');

function createResidenceInstance(doc) {
  return new Residence(doc);
}

module.exports = createResidenceInstance;
