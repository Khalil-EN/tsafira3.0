const readlineSync = require('readline-sync');



function Converter(value){
  if(value==='Single Trip'){
    return 1;
  }else if(value==='Family Trip'){
    return 3;
  }else {
    return 4;
  }
}

// Mock data for RABAT_PLANS and AGADIR_PLANS
const RABAT_PLANS = {
  "Art and Modernity": {
    name: "Art and Modernity",
    activitiesTypes: ["cultural", "art", "dining"],
    budgetLevel: "high",
    suitableFor: ["couples", "solo", "art lovers"],
    details: {
      Morning: [
        "8:00 - Breakfast at 'Paul Rabat': Croissants and fresh juice in a peaceful setting.",
        "9:30 - Mohammed VI Museum of Modern and Contemporary Art: Explore Moroccan and international art exhibitions.",
        "Duration: 2h."
      ],
      Afternoon: [
        "12:00 - Lunch at 'Golden Fish' (Sofitel Hotel): Fish specialties in an elegant setting.",
        "14:00 - Walk in the Botanical Trial Garden: Relax and enjoy the tranquility."
      ],
      Evening: [
        "18:00 - Stroll at Salé Marina: View of Hassan Tower and sunset.",
        "20:00 - Dinner at 'Le Dhow': A floating restaurant offering a unique view of the river."
      ]
    }
  },
  "Historical Journey": {
    name: "Historical Journey",
    activitiesTypes: ["historical", "cultural", "walking"],
    budgetLevel: "medium",
    suitableFor: ["history buffs", "couples", "families"],
    details: {
      Morning: [
        "8:00 - Breakfast at 'Café Maure': Traditional Moroccan tea and pastries.",
        "9:00 - Guided tour of the Kasbah of the Udayas: A UNESCO World Heritage site with stunning views of the Bou Regreg River.",
        "Duration: 2h."
      ],
      Afternoon: [
        "12:30 - Lunch at 'Dar Naji': Authentic Moroccan cuisine in a cozy atmosphere.",
        "14:00 - Visit Hassan Tower and Mausoleum of Mohammed V: Iconic landmarks showcasing Moroccan history."
      ],
      Evening: [
        "17:30 - Walk along the Bou Regreg riverfront: Relax with scenic views.",
        "19:00 - Dinner at 'Le Ziryab': Traditional Moroccan dining experience."
      ]
    }
  },
  "Relaxation and Leisure": {
    name: "Relaxation and Leisure",
    activitiesTypes: ["relaxation", "shopping", "dining"],
    budgetLevel: "low",
    suitableFor: ["solo", "families", "friends"],
    details: {
      Morning: [
        "8:30 - Breakfast at 'Bakery Rabat': Freshly baked goods and coffee.",
        "10:00 - Visit the Rabat Medina: Explore the vibrant souks and shop for local crafts."
      ],
      Afternoon: [
        "12:30 - Lunch at 'Tagine Palace': Affordable and delicious Moroccan tagines.",
        "14:00 - Relax at Rabat Beach: Enjoy the sea breeze and some quiet time."
      ],
      Evening: [
        "17:00 - Visit the Marina Shopping Mall: Shop and explore modern stores.",
        "19:30 - Dinner at 'Café Milano': Casual dining with an international menu."
      ]
    }
  },
  "Outdoor Adventure": {
    name: "Outdoor Adventure",
    activitiesTypes: ["adventure", "nature", "active"],
    budgetLevel: "medium",
    suitableFor: ["active people", "families", "friends"],
    details: {
      Morning: [
        "7:30 - Breakfast at 'Outdoor Café': Start the day with energy-boosting options.",
        "9:00 - Explore the Chellah Necropolis: Walk among ancient ruins and gardens."
      ],
      Afternoon: [
        "12:00 - Picnic at the Jardin Zoologique de Rabat: Enjoy lunch surrounded by nature.",
        "15:00 - Kayaking on the Bou Regreg River: A fun and adventurous water activity."
      ],
      Evening: [
        "18:00 - Sunset at the Oudayas Garden: Peaceful and picturesque.",
        "20:00 - Dinner at 'La Maison Arabe': Exquisite Moroccan dishes."
      ]
    }
  }
};


const AGADIR_PLANS = {
  "Nature and Adventure": {
    name: "Nature and Adventure",
    activitiesTypes: ["adventure", "nature", "outdoor"],
    budgetLevel: "high",
    suitableFor: ["adventure seekers", "active people"],
    details: {
      Morning: [
        "8:00 - Breakfast at 'Pure Passion Café': View of the Marina with a modern menu.",
        "9:30 - Hiking at Paradise Valley: Enjoy natural pools and stunning landscapes.",
        "Duration: 3h."
      ],
      Afternoon: [
        "12:30 - Lunch at 'Babakoul Café': Rustic café near Paradise Valley.",
        "15:00 - Quad biking on the dunes: An energetic experience in Agadir's desert surroundings."
      ],
      Evening: [
        "18:00 - Walk on the Agadir Corniche: Sunset by the sea.",
        "20:00 - Dinner at 'Le Pêcheur': Specializing in seafood with a modern ambiance."
      ]
    }
  },
  "Beach Relaxation": {
    name: "Beach Relaxation",
    activitiesTypes: ["relaxation", "nature", "dining"],
    budgetLevel: "medium",
    suitableFor: ["families", "couples", "friends"],
    details: {
      Morning: [
        "8:30 - Breakfast at 'Le Jardin d'Eau': Tranquil garden café.",
        "10:00 - Relax at Agadir Beach: Lounge under the sun or take a swim."
      ],
      Afternoon: [
        "12:30 - Lunch at 'Ocean Vagabond': Beachfront restaurant with organic dishes.",
        "14:30 - Beach activities: Try paddleboarding or beach volleyball."
      ],
      Evening: [
        "17:00 - Sunset at the Kasbah of Agadir Oufella: Stunning panoramic views.",
        "19:30 - Dinner at 'La Scala': French-Moroccan fusion cuisine."
      ]
    }
  },
  "Cultural Exploration": {
    name: "Cultural Exploration",
    activitiesTypes: ["cultural", "shopping", "art"],
    budgetLevel: "low",
    suitableFor: ["solo", "couples", "art lovers"],
    details: {
      Morning: [
        "8:00 - Breakfast at 'Café Tafarnout': Traditional Moroccan breakfast.",
        "9:30 - Visit the Agadir Museum of Amazigh Culture: Discover Berber heritage."
      ],
      Afternoon: [
        "12:00 - Lunch at 'Ibtissam': Affordable and authentic Moroccan cuisine.",
        "14:00 - Explore the Souk El Had: Shop for handicrafts, spices, and souvenirs."
      ],
      Evening: [
        "17:00 - Stroll in the Marina Agadir: Enjoy the lively atmosphere.",
        "19:00 - Dinner at 'Dôme': Mediterranean and Moroccan dishes in a chic setting."
      ]
    }
  },
  "Wellness and Spa": {
    name: "Wellness and Spa",
    activitiesTypes: ["relaxation", "health", "dining"],
    budgetLevel: "high",
    suitableFor: ["solo", "couples", "relaxed travelers"],
    details: {
      Morning: [
        "8:30 - Breakfast at 'Healthy Corner Café': Fresh juices and light meals.",
        "10:00 - Spa treatment at 'Argan Palace': Rejuvenate with traditional Moroccan hammam and massages."
      ],
      Afternoon: [
        "12:30 - Lunch at 'Riad Villa Blanche': A serene setting with gourmet dishes.",
        "15:00 - Yoga session by the beach: Relax and unwind with a guided session."
      ],
      Evening: [
        "18:00 - Sunset tea at 'Les Blancs': Overlooking the beach.",
        "20:00 - Dinner at 'Pure Passion Café': Elegant dining to end the day."
      ]
    }
  },
  "Family Fun": {
    name: "Family Fun",
    activitiesTypes: ["nature", "adventure", "family"],
    budgetLevel: "medium",
    suitableFor: ["families", "groups"],
    details: {
      Morning: [
        "8:00 - Breakfast at 'Panorama Café': Family-friendly café with great views.",
        "9:30 - Visit Crocoparc: Experience a unique crocodile park and lush gardens."
      ],
      Afternoon: [
        "12:30 - Lunch at 'Le Petit Pecheur': Fresh and simple seafood dishes.",
        "14:00 - Camel ride along the beach: A fun activity for all ages."
      ],
      Evening: [
        "17:00 - Mini-golf at Royal Park: Enjoy quality time together.",
        "19:30 - Dinner at 'O Playa': A relaxed atmosphere with a kids' menu."
      ]
    }
  }
};





/*function getUserPreferences() {
  console.log("\n=== Morocco Travel Planner ===");

  let city;
  while (true) {
    city = readlineSync.question("\nWould you like to visit Rabat or Agadir? ").toLowerCase().trim();
    if (city === "rabat" || city === "agadir") break;
    console.log("Please choose either Rabat or Agadir.");
  }

  console.log("\nPlease rate your interest in the following activities (1-5):");
  const interests = {
    cultural: parseInt(readlineSync.question("Cultural activities (museums, historical sites): "), 10),
    nature: parseInt(readlineSync.question("Nature and outdoors: "), 10),
    sports: parseInt(readlineSync.question("Sports and active activities: "), 10),
    shopping: parseInt(readlineSync.question("Shopping and urban exploration: "), 10),
    relaxation: parseInt(readlineSync.question("Relaxation and peaceful activities: "), 10)
  };

  console.log("\nWho are you traveling with?");
  console.log("1. Solo");
  console.log("2. Couple");
  console.log("3. Family");
  console.log("4. Friends group");
  const groupType = parseInt(readlineSync.question("Enter the number of your choice: "), 10);

  console.log("\nWhat's your preferred budget level?");
  console.log("1. Economic");
  console.log("2. Medium");
  console.log("3. Luxury");
  const budget = parseInt(readlineSync.question("Enter the number of your choice: "), 10);

  return { city, interests, groupType, budget };
}*/

function recommendPlan(city, interests, groupType, budget) {
  const plans = city === "Rabat" ? RABAT_PLANS : AGADIR_PLANS;
  let bestScore = -1;
  let recommendedPlan = null;

  const groupTypes = {
    1: ["solo", "couples"],
    2: ["couples", "relaxed travelers"],
    3: ["families", "groups"],
    4: ["groups", "active people"]
  };

  const budgetLevels = {
    1: "low",
    2: "medium",
    3: "high"
  };

  for (const [planName, plan] of Object.entries(plans)) {
    let score = 0;

    // Score based on activities
    for (const activityType of plan.activitiesTypes) {
      if (activityType in interests) {
        score += interests[activityType];
      }
    }

    // Score based on group type
    if (groupTypes[groupType].some(group => plan.suitableFor.includes(group))) {
      score += 10;
    }

    // Score based on budget match
    if (plan.budgetLevel === budgetLevels[budget]) {
      score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      recommendedPlan = planName;
    }
  }

  return recommendedPlan;
}

function displayDetailedPlan(planName, city) {
  const plans = city === "Rabat" ? RABAT_PLANS : AGADIR_PLANS;
  const plan = plans[planName];

  console.log("\n" + "=".repeat(50));
  console.log("\n", planName);
  console.log("=".repeat(50));

  for (const [timePeriod, activities] of Object.entries(plan.details)) {
    console.log("\n" , timePeriod ,  ":");
    activities.forEach(activity => console.log("-", activity));
  }
}

/*function main() {
  //const { city, interests, groupType, budget } = getUserPreferences();
  const recommendedPlan = recommendPlan(city, interests, groupType, budget);

  if (recommendedPlan) {
    displayDetailedPlan(recommendedPlan, city);

    if (readlineSync.question("\nWould you like to see another plan? (yes/no): ").toLowerCase().trim() === "yes") {
      const plans = city === "rabat" ? RABAT_PLANS : AGADIR_PLANS;
      console.log("\nAvailable plans:");
      Object.keys(plans).forEach((planName, index) => console.log(index + 1, "." ,planName));

      const choice = parseInt(readlineSync.question("\nEnter the number of the plan you'd like to see: "), 10);
      const selectedPlan = Object.keys(plans)[choice - 1];
      displayDetailedPlan(selectedPlan, city);
    }
  } else {
    console.log("No matching plan found.");
  }
}*/

//main();


function FinalPlan(city, interests, groupType, budget) {
  const recommendedPlanName = recommendPlan(city, interests, groupType, budget);
  
  if (recommendedPlanName) {
    displayDetailedPlan(recommendedPlanName,city);
    const plans = city === "Rabat" ? RABAT_PLANS : AGADIR_PLANS;
    const recommendedPlanDetails = plans[recommendedPlanName];

    // Return the recommended plan details in JSON format
    return {
      success: true,
      recommendedPlan: recommendedPlanDetails,
    };
  } else {
    // Return an error response if no matching plan is found
    return {
      success: false,
      message: "No matching plan found for the given preferences.",
    };
  }
}



function recommendPlans(city, interests, groupType, budgetLevel, days) {
  const plans = city === "Rabat" ? RABAT_PLANS : AGADIR_PLANS;
  const recommendedPlans = [];
  
  const groupTypes = {
    1: ["solo", "couples"],
    2: ["couples", "relaxed travelers"],
    3: ["families", "groups"],
    4: ["groups", "active people"]
  };

  /*const budgetLevels = {
    1: "low",
    2: "medium",
    3: "high"
  };*/

  // Calculate scores for all plans
  const scoredPlans = [];
  for (const [planName, plan] of Object.entries(plans)) {
    let score = 0;

    // Score based on activities
    for (const activityType of plan.activitiesTypes) {
      if (activityType in interests) {
        score += interests[activityType];
      }
    }

    // Score based on group type
    if (groupTypes[groupType].some(group => plan.suitableFor.includes(group))) {
      score += 10;
    }

    // Score based on budget match
    if (plan.budgetLevel === budgetLevel) {
      score += 5;
    }

    scoredPlans.push({ planName, score });
  }

  // Sort plans by score in descending order
  scoredPlans.sort((a, b) => b.score - a.score);

  // Select the top plans for the specified number of days
  for (let i = 0; i < days && i < scoredPlans.length; i++) {
    recommendedPlans.push(scoredPlans[i].planName);
  }

  return recommendedPlans;
}

function FinalPlans(city, interests, groupType, budget, days) {
  const recommendedPlansName = recommendPlans(city, interests, groupType, budget, days);
  
  if (recommendedPlansName) {
    for(i = 0; i<days; i++){
      displayDetailedPlan(recommendedPlansName[i],city);
    }
    const plans = city === "Rabat" ? RABAT_PLANS : AGADIR_PLANS;
    const recommendedPlansDetails = [];
    for(i = 0; i<days; i++){
      recommendedPlansDetails.push(plans[recommendedPlansName[i]]);
    }

    // Return the recommended plan details in JSON format
    return {
      success: true,
      recommendedPlan: recommendedPlansDetails,
    };
  } else {
    // Return an error response if no matching plan is found
    return {
      success: false,
      message: "No matching plan found for the given preferences.",
    };
  }
}

function budgetFilter(budget,days){
  const div = budget/days;
  if(div < 800){
    return "low";
  }else if(div < 2000){
    return "medium";
  }else {
    return "high";
  }

}




module.exports = {
  FinalPlan,
  Converter,
  displayDetailedPlan,
  FinalPlans,
  budgetFilter,
};
