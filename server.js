var express = require("express");

//const axios = require('axios');

/*async function filterImages(urls) {
  try {
    const res = await axios.post('http://localhost:5001/filter-images', { urls });
    const relevantUrls = res.data.relevant_images.map(img => img.url);
    return relevantUrls;
  } catch (err) {
    console.error('Error filtering images:', err);
    return [];
  }
}*/

var mongoose = require("mongoose");

var User = require("./schemas/userSchema");

const {getAllHotels, getAllRestaurants, getAllActivities} = require('./testNeon');


var app = express();

const {getBestActivities, getBestRestaurantsForActivities, divideIntoParts, transformData, getBudgetperPerson, normalizeActivityTypes} = require("./models/testPlan");

const systemManager = require('./system/SystemManager');
const { authenticateToken, authorizeRoles } = require('./middlewares/authMiddleware');


app.use(express.json());

app.use(express.urlencoded({extended: true}));


const mongoURI = 'mongodb://localhost:27017/TsafiraUsers'; 


mongoose.connect(mongoURI)
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.log('Error connecting to MongoDB:', error));

let port = 8000;

const Users = [];

var counter = 0;


app.post("/api/hello_world",(req,res) => {
    counter++;
    console.log("Request number ",counter," has been detected!!");
})

app.post("/api/getData2", (req,res) => {
    const pdata = {
        "id" : Users.length+1,
        "phoneNumber": req.body.phoneNumber,
        "password": req.body.password 
    };
    Users.push(pdata);
    console.log("Data received : ",pdata);
    res.status(200).send({
        "status_code": 200,
        "message": "User added successfully",
        "user": pdata
    });
})

app.post("/api/getData", (req,res) => {
  console.log(req.body);
  console.log("Done \n");
    const pdata = new User(req.body);
    pdata.save().then(() => {
        res.status(200).send({
            "status_code": 200,
            "message": "User added successfully",
            "user": pdata
        });

    }).catch(err => {
        console.log(err);
    })
});


app.post("/api/suggestedplans2",async (req,res) => {
  console.log(req.body);
  let { country, city,destinations, interests, groupType,nbrPeople, budget,category, days, day, month, year, accomodationType, hotelLocation, meals, restaurantTags, paymentPreferences, dietaryPreferences } = req.body;
  const userPreferences = { maxBudget: budget, minRating: 4, preferredAmenities: ["wifi", "breakfast", "air conditioning"], weight: { price: 0.4, rating: 0.3, distance: 0.2, amenities: 0.1 } };
  //interests = ["nature", "beach", "cultural"]; 
  const facilities = paymentPreferences.concat(dietaryPreferences);
  let restauTags = restaurantTags.map(item => item.split(' ')[0]);
  restauTags = restauTags.map(tag => tag.toLowerCase()); 
  meals = meals.map(meal => meal.toLowerCase()); 
  let interest = normalizeActivityTypes(interests);
  if(groupType === "Just Me"){
    nbrPeople = 1;
  }else if(groupType === "A Couple"){
    nbrPeople = 2;
  }
  console.log(nbrPeople);

  const hotels = await getAllHotels();

  const restaurants = await getAllRestaurants();

  const activities = await getAllActivities();

  try {
    const newBudget = getBudgetperPerson(budget,nbrPeople,days);
    //console.log('1\n');
    const bestActivities = getBestActivities(activities, newBudget, days, interest);
    //console.log('2\n');
    const bestRestaurantsForEachActivity = getBestRestaurantsForActivities(bestActivities, restaurants, newBudget, days, restauTags,meals,facilities); // morning activities
    //console.log('3\n');
    const dividedParts = divideIntoParts(bestRestaurantsForEachActivity);
    //console.log('4\n');
    console.log(dividedParts);
    

    const plan = transformData(dividedParts,meals,hotels,restaurants,userPreferences, nightActivities);
    
    //console.log('5\n');
    console.log(JSON.stringify(plan, null, 2));
    

    
      res.status(200).json({
        status_code: 200,
        message: "Plan recommended successfully",
        plan: plan,
     
  })
  } catch (error) {
    console.error("Error suggesting plan:", error);
    res.status(500).json({
      status_code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }

});


app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, birthDate, password } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !birthDate || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const result = await systemManager.registerUser({
      firstName, lastName, email, phoneNumber, birthDate, password
    });

    if (!result.success) {
      return res.status(409).json({ message: result.message });
    }

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post("/api/login", async (req,res) => {
  try{
    //const rememberMe = false;
    const { accessToken, refreshToken, user } = await systemManager.loginUser(req.body);
    /*res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // ms
    });*/
    return res.status(200).json({
      message: "Logged in successfully",
      accessToken, // the client stores this in memory or secure storage
      refreshToken,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        email: user.email
      }
    });
  }catch (error){
    console.log("Login error",error);
    return res.status(500).json({ message: "Internal server error" });
  }
})

app.post('/api/refresh', async (req, res) => {
  try{

    console.log("I'm here");
    const oldRefreshToken = req.body.refreshToken;
    console.log(oldRefreshToken);

  const result = await systemManager.refreshToken(oldRefreshToken);
  console.log(result);
  if (!result) return res.sendStatus(403);

  return res.status(200).json({
      message: "Token generated successfully",
      accessToken : result.accessToken, // the client stores this in memory or secure storage
    });
  }catch (error){
    console.log("Login error",error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post('/api/logout', async (req, res) => {
  const refreshToken = req.body.refreshToken; 

  try {
    if (!refreshToken) return res.sendStatus(204); 

    
    await systemManager.logoutUser(refreshToken);

    return res.sendStatus(204); 
  } catch (err) {
    console.error('Logout error:', err);
    res.sendStatus(500);
  }
});


app.post("/api/suggestedplans3",authenticateToken,authorizeRoles('admin','freemium','premium'), async (req,res) => {
  try{
    console.log(req.user.id)
    const suggestedPlan = await systemManager.generateSuggestedItinerary(req.user.id,req.body);
    if(!suggestedPlan){
      res.status(405).json({
        error: 'LIMIT_REACHED',
        message: 'You have reached your daily limit of plan suggestions.',
      });
    }else{
      res.status(200).json({
        status_code: 200,
        message: "Plan recommended successfully",
        plan: suggestedPlan, 
  })

    }
  } catch (error) {
    console.error("Error suggesting plan:", error);
    res.status(500).json({
      status_code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
})

app.get("/api/getHotels2",authenticateToken,authorizeRoles('admin','freemium','premium'), async (req, res) => {
  try {
    const residences = await systemManager.getAllHotels();

    res.json(residences);
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

app.get("/api/getRestaurants2",authenticateToken,authorizeRoles('admin','freemium','premium'),async (req, res) => {
  try {
    const restaurants = await systemManager.getAllRestaurants();
    res.json(restaurants);
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

app.get("/api/getActivities2",authenticateToken,authorizeRoles('admin','premium'), async (req, res) => {
  try {
    const activities = await systemManager.getAllActivities();
    res.json(activities);
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});


app.listen(port,'0.0.0.0', () => {
    console.log("Server is running on port ",port);
})