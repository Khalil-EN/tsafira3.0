const itineraryService = require('../services/itineraryService');
const SystemManager = require('../system/SystemManager');

class ItineraryManager {
  async createItinerary(data) {
    const itinerary = await itineraryService.createItinerary(data);
    await SystemManager.handleNewItinerary(itinerary); // Notify system of new itinerary
    return itinerary;
  }

  async getItineraryById(id) {
    return await itineraryService.getItineraryById(id);
  }

  async getUserItineraries(userId) {
    return await itineraryService.getItinerariesByUser(userId);
  }

  async updateItinerary(id, updates) {
    const updated = await itineraryService.updateItinerary(id, updates);
    await SystemManager.handleItineraryUpdate(updated); // Optional hook
    return updated;
  }

  async deleteItinerary(id) {
    const deleted = await itineraryService.deleteItinerary(id);
    await SystemManager.handleItineraryDeletion(id); // Optional hook
    return deleted;
  }
  countPeople(groupType,nbrOfPeople){
    if(groupType === "Just Me"){
      return 1;
    }else if(groupType === "A Couple"){
      return 2;
    }else{
      return nbrOfPeople;
    }
  }
  getBudgetperPerson(budget,duration,nbrOfPeople){
    const budgetperDay = budget / duration;
    const budgetperPerson = budgetperDay / nbrOfPeople; // should be divised between activities (2) = 30%, food = 30%, transport = 10%, and residency = 25% + some reservation = 5%
    return budgetperPerson;

  }
}

module.exports = new ItineraryManager();
