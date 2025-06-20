/*
  // 1st step : check if we have already an itenerary in the database that has almost the same inputs as this one
  // 2nd step : get all data about destination from database if step 1 is not satisfied
  // 3rd step : choose the best residence option for the user based on his desires
  // 4th step : create a template with fixed time for breakfast, lanch, and dinner with the appropriate number of days
  // 5th step : calculate a score for all the activities based on the inputs of the user (as well as other criteria like the reviews, the rating, (maybe history of user as well),etc). Note : we should deal with activities that are close to each other
  // 6th step : calculate a score for all the activities based on the inputs of the user (as well as other criteria like the distance to the chosen activities, the reviews, the rating, (maybe history of user as well),etc)
  // 6th step : sort the result from higher score to lowest
  // 7th step : send the best n scored plans to the user ( n = days)
}*/

// find the best activity - find if there is very close activities that are high scored as well - calculate time to get there(transport)(or only the distance! ) - !!add time passed in each activity ~ 1h-2h!! - if (transport time is high > 1h) then only this activity that will be suggested for that day (beside the night activities)

const MAX_DISTANCE = 5;
const PRICE_LEVEL_MAP = { '$': 50, '$$': 100, '$$$': 200, '$$$$': 400 };


function getBudgetperPerson(budget, numberofPeople, days){    // Done
    const budgetperDay = budget / days;
    const budgetperPerson = budgetperDay / numberofPeople; // should be divised between activities (2) = 30%, food = 30%, transport = 10%, and residency = 25% + some reservation = 5%
    return budgetperPerson;

}


function calculateDistance(lat1, lon1, lat2, lon2) { // Done
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
}


function groupNearbyActivities(activities, proximityThreshold = 1, differenceScore = 10) { //Done
    const groupedActivities = [];

    activities.forEach(activity => {
        let foundGroup = false;
        // Check if activity is near any existing group
        for (let group of groupedActivities) {
            const distance = calculateDistance(
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

function getBestActivities(activities, budget, days, interests) { //Done
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

        const distance = calculateDistance(
            currentActivity.latitude, currentActivity.longitude,
            previousActivity.latitude, previousActivity.longitude
        );

        // If the activity is too far, find a closer one and shift
        if (distance > MAX_DISTANCE) {
            for (let j = i + 1; j < groupedActivities.length; j++) {
                const nextActivity = groupedActivities[j];
                const nextDistance = calculateDistance(
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


function calculateActivityScore(activity, budget, days, interests,numberofPeople) {  //Done
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



function convertPriceLevel(priceLevel) { //Done
    if (!priceLevel || typeof priceLevel !== 'string') return 0;
  
    
    const parts = priceLevel.replace(/\s+/g, '').split('-');
  
    
    if (parts.length === 1) {
      return PRICE_LEVEL_MAP[parts[0]] || 0;
    }
  
    
    const values = parts.map(part => PRICE_LEVEL_MAP[part] || 0);
  
    if (values.length === 2) {
      return (values[0] + values[1]) / 2; 
    }
  
    return 0; 
  }



function calculateRestaurantScore(restaurant, activity, budget, days, interests,facilities) {
    let baseScore = calculateRestaurantScoreWithoutDistance(restaurant, budget, days, interests,facilities);
    let distance = getDistance(activity, restaurant);

    // Assign score based on proximity to the activity
    if (distance < 1) {
        baseScore += 20; // Very close
    } else if (distance < 5) {
        baseScore += 10; // Nearby
    } else if (distance < 10) {
        baseScore += 5; // Somewhat far
    }

    return baseScore;
}

function calculateRestaurantScoreWithoutDistance(restaurant, budget, days, interests, facilities) {  //Done
    let score = 0;

    price = convertPriceLevel(restaurant.pricelevel);


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

function getDistance(activity, restaurant) { // Done
    const R = 6371; // Earth radius in km
    let dLat = toRadians(restaurant.latitude - activity.latitude);
    let dLon = toRadians(restaurant.longitude - activity.longitude);
    let lat1 = toRadians(activity.latitude);
    let lat2 = toRadians(restaurant.latitude);

    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(deg) {  // Done
    return deg * (Math.PI / 180);
}

function getBestRestaurantsForActivities(activities, restaurants, budget, days, interests,meals,facilities) { // Done
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

      

function getBestRestaurantsForBreakfast(restaurants, residency, distance_threshold = 10){ // Done
    const nearbyBreakfastSpots = restaurants.filter(restaurant => restaurant.meals?.includes("breakfast") 
    && calculateDistance( residency.latitude, residency.longitude, restaurant.latitude, restaurant.longitude ) <= distance_threshold )
     .map(restaurant => { 
        const distance = calculateDistance( residency.latitude, residency.longitude, restaurant.latitude, restaurant.longitude );
        let score = 0;
        score += (1 / distance) * 10;
        score+= (restaurant.numberofreviews / 10);
        score+= (restaurant.rating) * 10;
        
          return { ...restaurant, score };
        })
        .sort((a, b) => b.score - a.score);
        return nearbyBreakfastSpots.length > 0 ? nearbyBreakfastSpots : null; 
}


function normalizeActivityTypes(activityArray) { // Done
    const mapping = {
      'Museums': 'museum',
      'Mountains': 'nature',
      'Beach': 'beach',
      'Gardens': 'nature',
      'Cultural Attractions': 'historical landmark',
      'Entertainement Activities': 'tourist attraction'
    };
  
    return activityArray.map(item => mapping[item] || item);
  }


function getBestResidency(residencies, userPreferences) { // Done
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


function divideIntoParts(bestRestaurantsForActivities, maxPerPart = 2) { // Done
    let parts = {}; // Keeps parts as an object

    for (let i = 0, j = 0; i < bestRestaurantsForActivities.length; i += maxPerPart, j++) {
        parts[j] = bestRestaurantsForActivities.slice(i, i + maxPerPart); // Correctly assigns slices to keys
    }

    return parts;
}

function transformData(input,meals,residencies,restaurants,userPreferences, nightActivities) { // meals should be added !!!!
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
            imageurl: item.image,
        })

    })
    

    return result;
}  // Done


const activities = [
    { name: "Sawma3at Hassan", price: 50, rating: 4.5, reviews: 1200, tags: ["nature", "beach"], latitude: 34.0241, longitude: 6.8229, imageurl : "https://www.visitrabat.com/wp-content/uploads/2019/05/hassan_33-min.jpg" },
    { name: "Mat7af Mohammed V", price: 20, rating: 4.2, reviews: 800, tags: ["cultural"], latitude: 34.02, longitude: 6.82 , imageurl : "https://momaa.org/wp-content/uploads/2019/10/Mohamed-VI-Museum-of-Modern-and-Contemporary-Art.png"},
    { name: "Dari7 Mohammed V", price: 0, rating: 4.8, reviews: 1500, tags: ["adventure", "nature"], latitude: 34.0226, longitude: 6.8215, imageurl : "https://www.visitrabat.com/wp-content/uploads/2019/04/mauloee_mohammed5_2.jpg" },
    { name: "Oudaya", price: 15, rating: 4.3, reviews: 600, tags: ["nature", "family"], latitude: 34.03, longitude: 6.88, imageurl : "https://images.memphistours.com/large/75e0e0cbb7e76afe2e054d091912bb41.jpg" },
    { name: "Chellah", price: 50, rating: 4.7, reviews: 2500, tags: ["family", "fun"], latitude: 40.07, longitude: 6.80, imageurl : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmaEdY3JL5g1m-gpuNaxlxpf92Z_c5X9KL6Q&s" },
    { name: "Corniche Rabat", price: 30, rating: 4.4, reviews: 1000, tags: ["cultural", "history"], latitude: 34.08, longitude: 6.75, imageurl : "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/7d/4f/bd/blick-auf-die-alt-altstadt.jpg?w=1200&h=1200&s=1" },
    { name: "Botanical Garden", price: 10, rating: 4.6, reviews: 1100, tags: ["nature", "relaxation"], latitude: 34.09, longitude: -6.85, imageurl : "https://lh5.googleusercontent.com/p/AF1QipPTiSU5qA99tSzpgXEXzXqoousnH_5gZBbVNoKq=w122-h92-k-no" },
    { name: "Shopping Mall", price: 5, rating: 4.0, reviews: 1500, tags: ["shopping", "modern"], latitude: 34.10, longitude: -6.87, imageurl : "https://lh5.googleusercontent.com/p/AF1QipNm79d91btPbVfNH6FuD8L7dwlP0EskL6csj-r1=w163-h92-k-no" },
    { name: "Art Gallery", price: 25, rating: 4.6, reviews: 950, tags: ["art", "cultural"], latitude: 34.12, longitude: -6.89, imageurl : "https://lh5.googleusercontent.com/p/AF1QipNNjIHEFE6Q62VW5L5OZvaZ9Yg0zDVnOmQPqmf7=w167-h92-k-no" },
    { name: "Night Club", price: 40, rating: 4.3, reviews: 2000, tags: ["nightlife", "fun"], latitude: 34.11, longitude: -6.90, imageurl : "https://lh5.googleusercontent.com/p/AF1QipOfrVqoFo92azl4JA8b4fym9z1lIzIXzW80dPNT=w163-h92-k-no" }
];


const restaurants = [
    { name: "Seafood Place", price: 40, rating: 4.7, reviews: 1300, tags: ["seafood"], latitude: 34.03, longitude: 6.85, imageurl : "https://media-cdn.tripadvisor.com/media/photo-o/08/1f/c2/31/la-fournee.jpg" },
    { name: "Local Diner", price: 25, rating: 4.1, reviews: 700, tags: ["local","breakfast"], latitude: 34.04, longitude: 6.81, imageurl : "https://media-cdn.tripadvisor.com/media/photo-o/07/da/b5/5c/la-sala-anne-marie.jpg" },
    { name: "Fancy Restaurant", price: 60, rating: 4.9, reviews: 1500, tags: ["gourmet","breakfast"], latitude: 34.06, longitude: 6.80, imageurl : "https://media-cdn.tripadvisor.com/media/photo-m/1280/2c/19/42/d2/texas-taco-and-quesadilla.jpg" },
    { name: "Budget Eatery", price: 15, rating: 4.3, reviews: 500, tags: ["fast food"], latitude: 34.01, longitude: 6.84, imageurl : "https://media-cdn.tripadvisor.com/media/photo-o/25/64/91/e8/hma-palace.jpg" },
    { name: "Vegetarian Delight", price: 30, rating: 4.6, reviews: 1200, tags: ["vegetarian"], latitude: 34.09, longitude: 6.86, imageurl : "https://media-cdn.tripadvisor.com/media/photo-w/2c/cb/72/ab/caption.jpg" },
    { name: "Italian Bistro", price: 45, rating: 4.7, reviews: 800, tags: ["italian"], latitude: 34.07, longitude: 6.82, imageurl : "https://media-cdn.tripadvisor.com/media/photo-m/1280/26/f0/3b/a2/caption.jpg" },
    { name: "Sushi Corner", price: 50, rating: 4.8, reviews: 1600, tags: ["sushi", "japanese"], latitude: 34.10, longitude: 6.88, imageurl : "https://media-cdn.tripadvisor.com/media/photo-m/1280/15/30/8e/e6/getlstd-property-photo.jpg" },
    { name: "Steakhouse Grill", price: 70, rating: 4.9, reviews: 1300, tags: ["steak", "grill"], latitude: 34.11, longitude: 6.79, imageurl : "https://media-cdn.tripadvisor.com/media/photo-o/28/73/41/82/lamb-and-terrace.jpg" },
    { name: "Pasta Paradise", price: 35, rating: 4.4, reviews: 950, tags: ["italian"], latitude: 34.12, longitude: 6.83, imageurl : "https://media-cdn.tripadvisor.com/media/photo-o/10/c9/b1/b5/von-einer-ruhigen-seitenstrass.jpg" },
    { name: "Burger Joint", price: 20, rating: 4.2, reviews: 1100, tags: ["fast food", "burgers"], latitude: 34.02, longitude: 6.80, imageurl : "https://media-cdn.tripadvisor.com/media/photo-o/12/e6/fb/3e/20180423-202458-largejpg.jpg" }
];

const residencies = [
    {
      name: "Hotel Sunset",
      price: 60,
      rating: 4.2,
      distanceToCenter: 1.5,
      amenities: ["wifi", "air conditioning", "breakfast"],
      latitude: 40.7128,
      longitude: -74.0060
    },
    {
      name: "Urban Retreat",
      price: 80,
      rating: 4.8,
      distanceToCenter: 0.8,
      amenities: ["wifi", "gym", "spa"],
      latitude: 34.06,
      longitude: 6.80,
      imageurl: 'https://media.istockphoto.com/id/119926339/photo/resort-swimming-pool.jpg?s=612x612&w=0&k=20&c=9QtwJC2boq3GFHaeDsKytF4-CavYKQuy1jBD2IRfYKc=',
    },
    {
      name: "Budget Inn",
      price: 40,
      rating: 3.9,
      distanceToCenter: 2.2,
      amenities: ["wifi"],
      latitude: 40.7150,
      longitude: -74.0150
    },
    {
      name: "Luxury Palace",
      price: 150,
      rating: 5.0,
      distanceToCenter: 0.5,
      amenities: ["wifi", "spa", "gym", "pool", "air conditioning"],
      latitude: 40.7142,
      longitude: -74.0025
    },
    {
      name: "City Center Lodge",
      price: 95,
      rating: 4.5,
      distanceToCenter: 0.2,
      amenities: ["wifi", "breakfast", "parking"],
      latitude: 40.7122,
      longitude: -74.0048
    }
  ];
  

  const nightActivities = [ { name: "Sky Lounge Bar", type: "activity", price: 25, rating: 4.6, reviews: 230, tags: ["bar", "nightlife", "rooftop"], latitude: 40.7561, longitude: -73.9864, imageurl: "https://example.com/images/sky-lounge.jpg", score: 0.92, }, 
  { name: "Jazz & Blues Club", type: "activity", price: 35, rating: 4.8, reviews: 180, tags: ["music", "club", "live"], latitude: 40.7401, longitude: -73.9947, imageurl: "https://example.com/images/jazz-blues.jpg", score: 0.88, },
   { name: "Moonlight Cinema", type: "activity", price: 18, rating: 4.4, reviews: 95, tags: ["movie", "outdoor", "romantic"], latitude: 40.7333, longitude: -73.9872, imageurl: "https://example.com/images/moonlight-cinema.jpg", score: 0.84, }, 
   { name: "Night River Cruise", type: "activity", price: 50, rating: 4.7, reviews: 120, tags: ["cruise", "sightseeing", "romantic"], latitude: 40.7032, longitude: -74.0170, imageurl: "https://example.com/images/night-cruise.jpg", score: 0.9, },
    { name: "Night Market Walk", type: "activity", price: 10, rating: 4.3, reviews: 75, tags: ["market", "local", "street food"], latitude: 40.7429, longitude: -74.0048, imageurl: "https://example.com/images/night-market.jpg", score: 0.81, } ];


const budget = 300;
const days = 3;
const interests = ["nature", "beach", "cultural"];
const facilities = ["WiFi","Takeout"];
isLanch = false;
isDinner = true;
meals = ['dinner','breakfast'];
const numberofPeople = 2;
const userPreferences = { maxBudget: budget, minRating: 4, preferredAmenities: ["wifi", "breakfast", "air conditioning"], weight: { price: 0.4, rating: 0.3, distance: 0.2, amenities: 0.1 } };



//const finalBudget = getBudgetperPerson(budget,numberofPeople,days);

//const bestActivities = getBestActivities(activities, budget, days, interests);

//console.log(bestActivities);

//const bestRestaurantsForEachActivity = getBestRestaurantsForActivities(bestActivities, restaurants, budget, days, interests,meals,facilities); // morning activities

//console.log(bestRestaurantsForEachActivity);

//const dividedParts = divideIntoParts(bestRestaurantsForEachActivity);

//console.log(dividedParts);

//const transformed = transformData(dividedParts,meals,residencies,restaurants,userPreferences, nightActivities);

//console.log(transformed);

//console.log(convertPriceLevel('$$- $$$$'));

/*const bestResidency = getBestResidency(residencies, userPreferences); 
console.log("Best Residency:", bestResidency);

const breakfastrestaurants = getBestRestaurantsForBreakfast(restaurants,bestResidency);
console.log(breakfastrestaurants)*/


//const test = calculateDistance(34.11,-6.9,34.02,6.82);  
//console.log(test);

const rawTypes = ['Museums', 'Beach', 'Gardens', 'Entertainement Activities'];
const normalized = normalizeActivityTypes(rawTypes);
console.log(normalized); // ['museum', 'beach', 'nature', 'tourist attraction']

module.exports = {
    getBestActivities,
    getBestRestaurantsForActivities,
    divideIntoParts,
    transformData,
    getBudgetperPerson,
    normalizeActivityTypes,
}


