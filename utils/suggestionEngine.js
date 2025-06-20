const locationManager = require('../business/locationManager');
const restaurantManager = require('../business/restaurantManager');


const MAX_DISTANCE = 5;


  const nightActivities = [ { name: "Sky Lounge Bar", type: "activity", price: 25, rating: 4.6, reviews: 230, tags: ["bar", "nightlife", "rooftop"], latitude: 40.7561, longitude: -73.9864, imageurl: "https://example.com/images/sky-lounge.jpg", score: 0.92, }, 
  { name: "Jazz & Blues Club", type: "activity", price: 35, rating: 4.8, reviews: 180, tags: ["music", "club", "live"], latitude: 40.7401, longitude: -73.9947, imageurl: "https://example.com/images/jazz-blues.jpg", score: 0.88, },
   { name: "Moonlight Cinema", type: "activity", price: 18, rating: 4.4, reviews: 95, tags: ["movie", "outdoor", "romantic"], latitude: 40.7333, longitude: -73.9872, imageurl: "https://example.com/images/moonlight-cinema.jpg", score: 0.84, }, 
   { name: "Night River Cruise", type: "activity", price: 50, rating: 4.7, reviews: 120, tags: ["cruise", "sightseeing", "romantic"], latitude: 40.7032, longitude: -74.0170, imageurl: "https://example.com/images/night-cruise.jpg", score: 0.9, },
    { name: "Night Market Walk", type: "activity", price: 10, rating: 4.3, reviews: 75, tags: ["market", "local", "street food"], latitude: 40.7429, longitude: -74.0048, imageurl: "https://example.com/images/night-market.jpg", score: 0.81, } ];

function calculateActivityScore(activity, budget, days, interests,numberofPeople) {
    let score = 0;
    /*if (activity.price < (budget * 0.15)) {
        score += 15;
    }*/
    interests.forEach(interest => {
        if (activity.activitytype === interest) {
            score += 100;
        }
    });
    score+= Math.log1p(activity.numberofreviews) / Math.log1p(1000);
    score += activity.rating * 10;
    return score;
  }
function  getBestActivities(activities, budget, days, interests) {
      // Calculate score for each activity
      let scoredActivities = activities.map(activity => ({
          ...activity,
          score: calculateActivityScore(activity, budget, days, interests),
          isFar: false
      }));
  
      // Group activities that are close together
      let groupedActivities = groupNearbyActivities(scoredActivities);
  
      // Sort activities based on score
      groupedActivities.sort((a, b) => b.score - a.score);
  
      // Ensure odd-positioned activities are not too far away
      for (let i = 1; i < groupedActivities.length; i += 2) {
          let foundClose = false;
          let currentActivity = groupedActivities[i];
          let previousActivity = groupedActivities[i - 1];
  
          const distance = locationManager.calculateDistance(
              currentActivity.latitude, currentActivity.longitude,
              previousActivity.latitude, previousActivity.longitude
          );
  
          // If the activity is too far, find a closer one and shift
          if (distance > MAX_DISTANCE) {
              for (let j = i + 1; j < groupedActivities.length; j++) {
                  const nextActivity = groupedActivities[j];
                  const nextDistance = locationManager.calculateDistance(
                      previousActivity.latitude, previousActivity.longitude,
                      nextActivity.latitude, nextActivity.longitude
                  );
  
                  if (nextDistance <= MAX_DISTANCE) {
                      foundClose = true;
                      const temp = groupedActivities[j][0];
                      for (let k = j; k > i; k--) {
                          groupedActivities[k][0] = groupedActivities[k - 1][0];
                      }
                      groupedActivities[i][0] = temp;
                      break;
                  }
              }
          }if(foundClose){
              previousActivity.isFar = false;
          }else{
              previousActivity.isFar = true;
          }
      }
  
      // Return the top 2 * days activities after adjustments
      return groupedActivities.slice(0, 2 * days);
  }

function groupNearbyActivities(activities, proximityThreshold = 1, differenceScore = 10) { //Done
    const groupedActivities = [];

    activities.forEach(activity => {
        let foundGroup = false;
        // Check if activity is near any existing group
        for (let group of groupedActivities) {
            const distance = locationManager.calculateDistance(
                activity.latitude, activity.longitude,
                group[0].latitude, group[0].longitude
            );
            const diff = Math.abs(activity.score - group[0].score);
            if (distance <= proximityThreshold && diff < differenceScore) { // If distance is within threshold (in km)
                group.push(activity); // Add to existing group
                foundGroup = true;
                break;
            }
        }
        if (!foundGroup) {
            groupedActivities.push([activity]); // Create a new group
        }
    });

    // Convert grouped activities into one object per group
    return groupedActivities.map(group => ({
        ...group[0], // Keep the first activity's properties
        activities: group // Store all activities in the group
    }));
}

function calculateRestaurantScoreWithoutDistance(restaurant, budget, days, interests, facilities) {
    let score = 0;

    price = restaurantManager.convertPriceLevel(restaurant.pricelevel);


    if (price < budget * 0.1) {
        score += 15;
    }
    interests.forEach(interest => {
        if (restaurant.tags.includes(interest)) {
            score += 10;
        }
    });
    facilities.forEach(facility => {
        if (restaurant.facilities.includes(facility)) {
            score += 5;
        }
    });

    score+=restaurant.numberofreviews * 0.01;
    score += restaurant.rating * 10;
    return score;
}

function calculateRestaurantScore(restaurant, activity, budget, days, interests,facilities) {
    let baseScore = calculateRestaurantScoreWithoutDistance(restaurant, budget, days, interests,facilities);
    const lat1 = activity.latitude;
    const lat2 = restaurant.latitude;
    const long1 = activity.longitude;
    const long2 = restaurant.longitude;
    let distance = locationManager.calculateDistance(lat1,long1, lat2,long2);
    if (distance < 1) {
        baseScore += 20; // Very close
    } else if (distance < 5) {
        baseScore += 10; // Nearby
    } else if (distance < 10) {
        baseScore += 5; // Somewhat far
    }

    return baseScore;
}

function getBestRestaurantsForActivities(activities, restaurants, budget, days, interests,meals,facilities) {
    let chosenRestaurants = new Set(); // Keep track of selected restaurants
    let counter = 0;
    isDinner = false;
    isLunch = false;
    if(meals.includes("dinner")){
        isDinner = true;
    }

    if(meals.includes('lunch')){
        isLunch = true;
    }

    return activities.map(activity => {
        let bestRestaurant = null;
        if ((counter % 2 === 0 && isLunch) || (counter % 2 === 1 && isDinner)) {
            bestRestaurant = restaurants
            .map(restaurant => ({
                ...restaurant,
                score: calculateRestaurantScore(restaurant, activity, budget, days, interests,facilities)
            }))
            .sort((a, b) => b.score - a.score) // Sort by score
            .find(restaurant => !chosenRestaurants.has(restaurant.name)); // Pick first available restaurant

            if (bestRestaurant) {
                chosenRestaurants.add(bestRestaurant.name); // Mark restaurant as chosen
            }
        }
        counter++;

        return { activity, bestRestaurant };
    });
}

function getBestRestaurantsForBreakfast(restaurants, residency, distance_threshold = 10){ // Need to be tested
    const nearbyBreakfastSpots = restaurants.filter(restaurant => restaurant.meals?.includes("breakfast") 
    && locationManager.calculateDistance( residency.latitude, residency.longitude, restaurant.latitude, restaurant.longitude ) <= distance_threshold )
     .map(restaurant => { 
        const distance = locationManager.calculateDistance( residency.latitude, residency.longitude, restaurant.latitude, restaurant.longitude );
        let score = 0;
        score += (1 / distance) * 10;
        score+= (restaurant.numberofreviews / 10);
        score+= (restaurant.rating) * 10;
        
          return { ...restaurant, score };
        })
        .sort((a, b) => b.score - a.score);
        return nearbyBreakfastSpots.length > 0 ? nearbyBreakfastSpots : null; 
}

function getBestResidency(residencies, userPreferences) {  // This method is not in the residence manager because it requires distance calculation
    if (!residencies || residencies.length === 0) return null;

    const { maxBudget, minRating, preferredAmenities = [], weight = { price: 0.4, rating: 0.3, distance: 0.2, amenities: 0.1 } } = userPreferences;
    
    let bestResidency = null; let highestScore = -Infinity;
    
    residencies.forEach(residency => { 
        const price = residency.pricerange;
        const rating = residency.rating;
        const numberofreviews = residency.numberofreviews;
        const amenities = residency.amenities;
        // we can add the distance later
        const priceScore = price <= maxBudget * 0.3 * 2 ? 1 - price / (maxBudget * 0.3 *2) : 0; // 30% for residency
        const ratingScore = Math.max(0, rating - minRating) / (5 - minRating);
        //const distanceScore = 1 / (1 + distanceToCenter);
        const amenityScore = preferredAmenities.length > 0
        ? preferredAmenities.filter(a => amenities.includes(a)).length / preferredAmenities.length
        : 0;
        const reviewsScore = Math.log1p(numberofreviews) / Math.log1p(1000); // Scale between 0 and ~1
    
        const totalScore =
        weight.price * priceScore +
        weight.rating * ratingScore +
        //weight.distance * distanceScore +
        weight.amenities * amenityScore +
        reviewsScore;
        
        if (totalScore > highestScore) {
        highestScore = totalScore;
        bestResidency = { ...residency, score: totalScore };
        }
    });
    
    return bestResidency; 
}

function divideIntoParts(bestRestaurantsForActivities, maxPerPart = 2) {
    let parts = {}; // Keeps parts as an object

    for (let i = 0, j = 0; i < bestRestaurantsForActivities.length; i += maxPerPart, j++) {
        parts[j] = bestRestaurantsForActivities.slice(i, i + maxPerPart); // Correctly assigns slices to keys
    }

    return parts;
}

function transformData(input,meals,residencies,restaurants,userPreferences) { // meals should be added !!!!
    const result = {};
    let finalIndex = 1;
    const residency = getBestResidency(residencies,userPreferences);
    let breakfastRestaurants = {};
    console.log(residency);
    if(meals.includes("breakfast")){
        breakfastRestaurants = getBestRestaurantsForBreakfast(restaurants,residency);        
    }
    console.log(breakfastRestaurants);
    result["0"] = residency ? [{ name: residency.name, type: "residency", price: residency.price, rating: residency.rating, reviews: residency.reviews, tags: residency.amenities, latitude: residency.latitude, longitude: residency.longitude, imageurl: residency.image, score: residency.score, }] : null;

    // Iterate over each key in the input (e.g., "0", "1", etc.)
    Object.keys(input).forEach(originalKey => {
        const dayKey = (parseInt(originalKey) + 1).toString();
        result[dayKey] = [];
        finalIndex++;
        
        let seenActivities = new Set(); // Set to track unique activities

        let counter = 0;

        if (meals.includes("breakfast") && breakfastRestaurants.length > 0) {
            const breakfast = breakfastRestaurants.shift(); // pick one for the day
            if (breakfast && !seenActivities.has(breakfast.name)) {
              result[dayKey].push({
                name: breakfast.name,
                type: "restaurant",
                price: breakfast.pricelevel,
                rating: breakfast.rating,
                reviews: breakfast.numberofreviews,
                tags: breakfast.tags,
                latitude: breakfast.latitude,
                longitude: breakfast.longitude,
                imageurl: breakfast.image,
                score: breakfast.score,
              });
              seenActivities.add(breakfast.name);
            }
          }
          

        input[originalKey].forEach(item => {
            const activity = item.activity;
            const restaurant = item.bestRestaurant;

            // Add main activity if not already added
            if (!seenActivities.has(activity.name)) {
                result[dayKey].push({
                    name: activity.name,
                    type: "activity",
                    //price: activity.price,
                    rating: activity.rating,
                    reviews: activity.numberofreviews,
                    tags: activity.activitytype,
                    latitude: activity.latitude,
                    longitude: activity.longitude,
                    imageurl: activity.image,
                    score: activity.score,
                    isFar: activity.isFar,
                });
                seenActivities.add(activity.name);
            }

            // Add sub-activities while ensuring uniqueness
            if (activity.activities) {
                activity.activities.forEach(subActivity => {
                    if (!seenActivities.has(subActivity.name)) {
                        result[dayKey].push({
                            name: subActivity.name,
                            type: "activity",
                            //price: subActivity.price,
                            rating: subActivity.rating,
                            reviews: subActivity.numberofreviews,
                            tags: subActivity.activitytype,
                            latitude: subActivity.latitude,
                            longitude: subActivity.longitude,
                            imageurl: subActivity.image,
                            score: subActivity.score,
                            isFar: subActivity.isFar,
                        });
                        seenActivities.add(subActivity.name);
                    }
                });
            }
            const isLunchSlot = counter % 2 === 0;
            const isDinnerSlot = counter % 2 === 1;
            if (isLunchSlot && meals.includes("lunch")){
                if (!seenActivities.has(restaurant.name)){
                    result[dayKey].push({
                        name: restaurant.name,
                        type: "restaurant",
                        price: restaurant.pricelevel,
                        rating: restaurant.rating,
                        reviews: restaurant.numberofreviews,
                        tags: restaurant.tags,
                        latitude: restaurant.latitude,
                        longitude: restaurant.longitude,
                        imageurl: restaurant.image,
                        score: restaurant.score,
                      });
                      seenActivities.add(restaurant.name);

                }
            }else if (isDinnerSlot && meals.includes("dinner")){
                //if (!seenActivities.has(restaurant.name)){
                    result[dayKey].push({
                        name: restaurant.name,
                        type: "restaurant",
                        price: restaurant.pricelevel,
                        rating: restaurant.rating,
                        reviews: restaurant.numberofreviews,
                        tags: restaurant.tags,
                        latitude: restaurant.latitude,
                        longitude: restaurant.longitude,
                        imageurl: restaurant.image,
                        score: restaurant.score,
                      });
                      seenActivities.add(restaurant.name);
                //}
            }
            counter++;
    });
    });
    const finalI = (parseInt(finalIndex) ).toString();
    result[finalI] = [];
    nightActivities.forEach(item => {
        result[finalI].push({
            name: item.name,
            type: "Night activity",
            price: item.price,
            rating: item.rating,
            reviews: item.reviews,
            tags: item.tags,
            latitude: item.latitude,
            longitude: item.longitude,
            imageurl: item.imageurl,
        })

    })
    

    return result;
}



module.exports = {
  getBestActivities,
  getBestRestaurantsForActivities,
  divideIntoParts,
  transformData
};