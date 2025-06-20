const userManager = require('../business/userManager');
const itineraryManager = require('../business/itineraryManager');
const planManager = require('../business/planManager');
const residenceManager = require('../business/residenceManager');
const restaurantManager = require('../business/restaurantManager');
const activityManager = require('../business/activityManager');
const iteniraryManager = require('../business/itineraryManager');
const locationManager = require('../business/locationManager');
const suggestionEngine = require('../utils/suggestionEngine');
const securityManager = require("./securityManager");




class SystemManager {
  // ========================
  // 🔹 USER
  // ========================
  async registerUser(userData) {
    return await securityManager.register(userData);
  }

  async loginUser(credentials) {
    const {email, password, rememberMe} = credentials;
    return await securityManager.login(email, password, rememberMe);
  }

  async logoutUser(refreshToken){
      return securityManager.logout(refreshToken);
  }

  async refreshToken(refreshToken){
    return await securityManager.refreshToken(refreshToken);

  }

  handleNewUser(user) {
    console.log(`[SystemManager] New user registered: ${user.email}`);
    // TODO: trigger onboarding sequence, analytics, welcome email, etc.
  }

  logDeactivation(user) {
    console.log(`[SystemManager] User deactivated: ${user.email}`);
    // TODO: log audit event or notify admin
  }

  // ========================
  // 🔹 ITINERARY
  // ========================
  async createItinerary(userId, data) {
    const itineraryData = { ...data, userId };
    const itinerary = await itineraryManager.createItinerary(itineraryData);
    this.handleNewItinerary(itinerary);
    return itinerary;
  }

  async getItineraryDetails(id) {
    return await itineraryManager.getItineraryById(id);
  }

  handleNewItinerary(itinerary) {
    console.log(`[SystemManager] New itinerary created: ${itinerary.title}`);
    // TODO: sync to search index, notify user, trigger recommendation engine
  }

  handleItineraryUpdate(itinerary) {
    console.log(`[SystemManager] Itinerary updated: ${itinerary._id}`);
    // TODO: re-run itinerary validation or scoring
  }

  handleItineraryDeletion(itineraryId) {
    console.log(`[SystemManager] Itinerary deleted: ${itineraryId}`);
    // TODO: cleanup or archive logic
  }

  // ========================
  // 🔹 PLAN
  // ========================
  async createPlanForItinerary(itineraryId, planInput) {
    const planData = { ...planInput, itineraryId };
    const plan = await planManager.createNewPlan(planData);
    this.handleNewPlan(plan);
    return plan;
  }

  handleNewPlan(plan) {
    console.log(`[SystemManager] New plan added (day ${plan.dayNumber}) to itinerary ${plan.itineraryId}`);
    // TODO: notify user, re-score itinerary, log metrics
  }

  handlePlanUpdate(plan) {
    console.log(`[SystemManager] Plan updated: ${plan._id}`);
    // TODO: trigger sync or validation
  }

  handlePlanDeletion(planId) {
    console.log(`[SystemManager] Plan deleted: ${planId}`);
    // TODO: archive or cleanup
  }

  // ========================
  // 🔹 Residence
  // ========================

  async addResidence(data) {
    const residence = await residenceManager.createResidence(data);
    this.handleNewResidence(residence);
    return residence;
  }

  async getAllHotels(){
    const residences = await residenceManager.listResidences();
    const results = residences.map((row) => ({
      name: row.name,
      price: row.pricerange,
      rating: row.rating,
      imageurl: row.image,
      location: row.address,
      description: row.description,
      detailimages: row.secondaryimages,
      reviews: row.numberofreviews,
      amenities: row.amenities,
    }));
    console.log(results);
    return results;
  }


  async handleNewResidence(residence) {
    // Placeholder: notify admin, refresh cache, index in search, etc.
    console.log(`New residence added: ${residence.name}`);
    }


    // ========================
  // 🔹 Restaurant
  // ========================
  async addRestaurant(data) {
    const restaurant = await restaurantManager.addRestaurant(data);
    this.notifyNewRestaurant(restaurant);
    return restaurant;
  }

  async getAllRestaurants(){
    const restaurants = await restaurantManager.listRestaurants();
    const results = restaurants.map((row) => ({
      name: row.name,
      price: row.pricelevel,
      rating: row.rating,
      imageurl: row.image,
      location: row.address,
      openingHours: row.openingHours,
      reviews: row.numberofreviews,
      description: row.description,
      facilities: row.facilities,
      detailimages: row.images,
    }));
    return results;

  }

  async notifyNewRestaurant(restaurant) {
    // Placeholder: notify admin, refresh cache, index in search, etc.
    console.log(`New restaurant added: ${restaurant.name}`);
    }

  // ========================
  // 🔹 Activity
  // ========================

  async createActivity(data){
    const activity = await activityManager.createNewActivity(data);
    this.logNewActivity(activity);
    return activity;
  }

  async getAllActivities(){
    const activities = await activityManager.getAllActivities();
    const results = activities.map((row) => ({
              name: row.name,
              //price: row.priceLevel,
              rating: row.rating,
              imageurl: row.image,
              location: row.address,
              type: row.activitytype,
              reviews: row.numberofreviews,
    }));
    return results;
  }
  




  async logNewActivity(activity) {
  console.log(`📝 New activity logged: ${activity.name} (${activity.id})`);
}



  // ========================
  // 🔹 Suggestions 
  // ========================
  async generateSuggestedItinerary(userId,userPreferences) {
    console.log(userId);

    if(!(await userManager.checkSuggestionLimit(userId))){
      return false;
    }



    console.log('[SystemManager] Suggesting itinerary for:', userPreferences);


    let { country, city,destinations, interests, groupType,nbrPeople, budget,category, days, day, month, year, accomodationType, hotelLocation, meals, restaurantTags, paymentPreferences, dietaryPreferences } = userPreferences;
    const userPreferences2 = { maxBudget: budget, minRating: 4, preferredAmenities: ["wifi", "breakfast", "air conditioning"], weight: { price: 0.4, rating: 0.3, distance: 0.2, amenities: 0.1 } };
    const facilities = paymentPreferences.concat(dietaryPreferences);
    meals = meals.map(meal => meal.toLowerCase());
    let restauTags = restaurantManager.cleanTypeofCuisine(restaurantTags); 
    let interest = activityManager.normalizeActivityTypes(interests);
    nbrPeople = iteniraryManager.countPeople(groupType,nbrPeople);
    //console.log(nbrPeople);

    const hotels = await residenceManager.listResidences(); // Later, add a filter : {city : city}

    const restaurants = await restaurantManager.listRestaurants(); // Later, add a filter : {city : city}

    const activities = await activityManager.getAllActivities(); // Later, add a filter : {city : city}

    try {
      const newBudget = iteniraryManager.getBudgetperPerson(budget,nbrPeople,days);
      const bestActivities = suggestionEngine.getBestActivities(activities, newBudget, days, interest);
      const bestRestaurantsForEachActivity = suggestionEngine.getBestRestaurantsForActivities(bestActivities, restaurants, newBudget, days, restauTags,meals,facilities); // morning activities
      const dividedParts = suggestionEngine.divideIntoParts(bestRestaurantsForEachActivity);
      //console.log(dividedParts);
      

      const plan = suggestionEngine.transformData(dividedParts,meals,hotels,restaurants,userPreferences2);
      
      console.log(JSON.stringify(plan, null, 2));
      return plan;
    }catch (err){
      console.log(err);
    };
  }

  async generatePlansFromPreferences(userPreferences, itineraryId) {
    console.log('[SystemManager] Generating plans from preferences:', userPreferences);
    // TODO: implement plan generator logic
    return [];
  }
}

module.exports = new SystemManager();
