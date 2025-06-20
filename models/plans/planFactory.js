const BasicPlan = require('./BasicPlan');

class PlanFactory {
  static createPlan(planData) {
    return new BasicPlan(planData);
  }
}

module.exports = PlanFactory;
