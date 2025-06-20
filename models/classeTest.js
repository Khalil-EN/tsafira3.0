// ------- Database Connection (Example with MongoDB) -------
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Connect to MongoDB (You would configure this with your actual connection string)
mongoose.connect('mongodb://localhost:27017/travel_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(err => console.error('MongoDB connection error:', err));

// ------- Models (schemas would be defined elsewhere) -------
// Importing mongoose models (these would be defined in separate files)
const UserModel = require('./models/user');
const ItineraryModel = require('./models/itinerary');
const PlanModel = require('./models/plan');
const LocationModel = require('./models/location');
const ReservationModel = require('./models/reservation');
// ... other model imports

// ------- Core Entity Classes with Methods -------

class User {
  constructor(id, username, phoneNumber, email, passwordHash, profilePicture, location, lastLoginDate, status, preferences) {
    this.id = id;
    this.username = username;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.passwordHash = passwordHash;
    this.profilePicture = profilePicture;
    this.location = location;
    this.lastLoginDate = lastLoginDate || new Date();
    this.status = status || 'active';
    this.preferences = preferences || {};
    this.createdAt = new Date();
  }

  // Convert MongoDB document to User instance
  static fromDocument(doc) {
    return new User(
      doc._id,
      doc.username,
      doc.phoneNumber,
      doc.email,
      doc.passwordHash,
      doc.profilePicture,
      doc.location,
      doc.lastLoginDate,
      doc.status,
      doc.preferences
    );
  }

  // Register a new user
  static async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await UserModel.findOne({ 
        $or: [{ email: userData.email }, { username: userData.username }] 
      });
      
      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);
      
      // Create new user with hashed password
      const newUser = new UserModel({
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        passwordHash: passwordHash,
        profilePicture: userData.profilePicture || '',
        location: userData.location || '',
        preferences: userData.preferences || {},
        status: 'active',
        lastLoginDate: new Date(),
        createdAt: new Date()
      });
      
      const savedUser = await newUser.save();
      
      // Generate JWT token
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      return {
        success: true,
        token,
        user: {
          id: savedUser._id,
          username: savedUser.username,
          email: savedUser.email,
          profilePicture: savedUser.profilePicture
        }
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // User login
  static async login(email, password) {
    try {
      // Find user by email
      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }
      
      // Update last login date
      user.lastLoginDate = new Date();
      await user.save();
      
      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      return {
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture
        }
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Update user profile
  static async updateProfile(userId, profileData) {
    try {
      // Prevent updating sensitive fields directly
      delete profileData.passwordHash;
      delete profileData.email; // Email change should have a separate flow with verification
      
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: profileData },
        { new: true }
      );
      
      if (!updatedUser) {
        throw new Error('User not found');
      }
      
      return {
        success: true,
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          profilePicture: updatedUser.profilePicture,
          location: updatedUser.location,
          preferences: updatedUser.preferences
        }
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Reset password
  static async resetPassword(userId, oldPassword, newPassword) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verify old password
      const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);
      
      user.passwordHash = passwordHash;
      await user.save();
      
      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Delete user account
  static async deleteAccount(userId) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $set: { status: 'deleted' } },
        { new: true }
      );
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return { success: true, message: 'Account marked as deleted' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Follow another user
  static async followUser(userId, targetUserId) {
    try {
      // Check if both users exist
      const [user, targetUser] = await Promise.all([
        UserModel.findById(userId),
        UserModel.findById(targetUserId)
      ]);
      
      if (!user || !targetUser) {
        throw new Error('User not found');
      }
      
      // Check if already following
      if (user.following && user.following.includes(targetUserId)) {
        return { success: true, message: 'Already following this user' };
      }
      
      // Update following list for user
      await UserModel.findByIdAndUpdate(
        userId,
        { $addToSet: { following: targetUserId } }
      );
      
      // Update followers list for target user
      await UserModel.findByIdAndUpdate(
        targetUserId,
        { $addToSet: { followers: userId } }
      );
      
      return { success: true, message: 'User followed successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get friend list (people the user follows)
  static async getFriendList(userId) {
    try {
      const user = await UserModel.findById(userId).populate('following', 'username profilePicture');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        success: true,
        friends: user.following || []
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Verify email with SMS code
  static async verifyEmail(userId, smsCode) {
    try {
      // In a real app, you would check the SMS code against a stored verification code
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Mock verification (in a real app, compare against stored verification code)
      const isValidCode = smsCode === '123456'; // Example verification
      
      if (!isValidCode) {
        throw new Error('Invalid verification code');
      }
      
      user.isEmailVerified = true;
      await user.save();
      
      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Save a plan to user's saved plans
  static async savePlan(userId, planId) {
    try {
      const result = await UserModel.findByIdAndUpdate(
        userId,
        { $addToSet: { savedPlans: planId } },
        { new: true }
      );
      
      if (!result) {
        throw new Error('User not found');
      }
      
      return { success: true, message: 'Plan saved successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get user's itinerary history
  static async getHistory(userId) {
    try {
      const userItineraries = await UserItineraryModel.find({ userId })
        .populate({
          path: 'itineraryId',
          select: 'title durationDays budget intensity type createdAt'
        });
      
      const itineraries = userItineraries.map(ui => ui.itineraryId);
      
      return {
        success: true,
        itineraries
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Authenticate user (check if token is valid)
  static async authenticate(token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user exists and is active
      const user = await UserModel.findOne({ _id: decoded.id, status: 'active' });
      
      if (!user) {
        throw new Error('Invalid token or user not found');
      }
      
      return {
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture
        }
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get customer support
  static async getSupport(userId, message, category) {
    try {
      // Create support ticket
      const newTicket = new SupportTicketModel({
        userId,
        message,
        category,
        status: 'open',
        createdAt: new Date()
      });
      
      await newTicket.save();
      
      // Create notification for user
      await Notification.sendNotification(
        userId,
        'Your support request has been received. We will get back to you soon.',
        'support'
      );
      
      return { 
        success: true, 
        message: 'Support request submitted successfully',
        ticketId: newTicket._id
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

class Itinerary {
  constructor(id, hotelId, title, durationDays, budget, intensity, type) {
    this.id = id;
    this.hotelId = hotelId;
    this.title = title;
    this.durationDays = durationDays;
    this.budget = budget;
    this.intensity = intensity;
    this.type = type;
    this.createdAt = new Date();
  }

  // Create a new itinerary
  static async createItinerary(userId, itineraryData) {
    try {
      const newItinerary = new ItineraryModel({
        title: itineraryData.title,
        hotelId: itineraryData.hotelId,
        durationDays: itineraryData.durationDays,
        budget: itineraryData.budget,
        intensity: itineraryData.intensity,
        type: itineraryData.type,
        createdAt: new Date()
      });
      
      const savedItinerary = await newItinerary.save();
      
      // Create UserItinerary relationship
      const userItinerary = new UserItineraryModel({
        userId,
        itineraryId: savedItinerary._id,
        role: 'owner',
        addedAt: new Date()
      });
      
      await userItinerary.save();
      
      return {
        success: true,
        itinerary: savedItinerary
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Add a plan to an itinerary
  static async addPlan(itineraryId, planId, dayNumber) {
    try {
      // Check if itinerary exists
      const itinerary = await ItineraryModel.findById(itineraryId);
      if (!itinerary) {
        throw new Error('Itinerary not found');
      }
      
      // Check if plan exists
      const plan = await PlanModel.findById(planId);
      if (!plan) {
        throw new Error('Plan not found');
      }
      
      // Create PlanItinerary relationship
      const planItinerary = new PlanItineraryModel({
        planId,
        itineraryId,
        dayNumber,
        note: ''
      });
      
      await planItinerary.save();
      
      return { success: true, message: 'Plan added to itinerary' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Remove a plan from an itinerary
  static async removePlan(itineraryId, planId) {
    try {
      const result = await PlanItineraryModel.findOneAndDelete({
        itineraryId,
        planId
      });
      
      if (!result) {
        throw new Error('Plan not found in this itinerary');
      }
      
      return { success: true, message: 'Plan removed from itinerary' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Update itinerary details
  static async updateItinerary(itineraryId, details) {
    try {
      const updatedItinerary = await ItineraryModel.findByIdAndUpdate(
        itineraryId,
        { $set: details },
        { new: true }
      );
      
      if (!updatedItinerary) {
        throw new Error('Itinerary not found');
      }
      
      return {
        success: true,
        itinerary: updatedItinerary
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Share itinerary with another user
  static async shareItinerary(itineraryId, ownerUserId, targetUserId, role = 'viewer') {
    try {
      // Check if user has permission to share (must be owner)
      const userItinerary = await UserItineraryModel.findOne({
        userId: ownerUserId,
        itineraryId,
        role: 'owner'
      });
      
      if (!userItinerary) {
        throw new Error('You do not have permission to share this itinerary');
      }
      
      // Check if already shared with target user
      const existingShare = await UserItineraryModel.findOne({
        userId: targetUserId,
        itineraryId
      });
      
      if (existingShare) {
        return { success: true, message: 'Itinerary already shared with this user' };
      }
      
      // Create new share
      const newShare = new UserItineraryModel({
        userId: targetUserId,
        itineraryId,
        role,
        addedAt: new Date()
      });
      
      await newShare.save();
      
      // Create notification for target user
      await Notification.sendNotification(
        targetUserId,
        `${userItinerary.username} has shared an itinerary with you: "${itineraryId.title}"`,
        'share'
      );
      
      return { success: true, message: 'Itinerary shared successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Duplicate an itinerary
  static async duplicateItinerary(itineraryId, userId) {
    try {
      // Find original itinerary
      const originalItinerary = await ItineraryModel.findById(itineraryId);
      if (!originalItinerary) {
        throw new Error('Itinerary not found');
      }
      
      // Create new itinerary with same properties
      const newItinerary = new ItineraryModel({
        title: `Copy of ${originalItinerary.title}`,
        hotelId: originalItinerary.hotelId,
        durationDays: originalItinerary.durationDays,
        budget: originalItinerary.budget,
        intensity: originalItinerary.intensity,
        type: originalItinerary.type,
        createdAt: new Date()
      });
      
      const savedItinerary = await newItinerary.save();
      
      // Create UserItinerary relationship
      const userItinerary = new UserItineraryModel({
        userId,
        itineraryId: savedItinerary._id,
        role: 'owner',
        addedAt: new Date()
      });
      
      await userItinerary.save();
      
      // Copy all plans from original itinerary
      const planItineraries = await PlanItineraryModel.find({ itineraryId });
      
      for (const pi of planItineraries) {
        const newPlanItinerary = new PlanItineraryModel({
          planId: pi.planId,
          itineraryId: savedItinerary._id,
          dayNumber: pi.dayNumber,
          note: pi.note
        });
        
        await newPlanItinerary.save();
      }
      
      return {
        success: true,
        itinerary: savedItinerary
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Export itinerary to a specific format
  static async exportItinerary(itineraryId, format) {
    try {
      // Find itinerary with all related data
      const itinerary = await ItineraryModel.findById(itineraryId);
      if (!itinerary) {
        throw new Error('Itinerary not found');
      }
      
      // Get all plans for this itinerary
      const planItineraries = await PlanItineraryModel.find({ itineraryId })
        .sort('dayNumber')
        .populate('planId');
      
      // Prepare data for export
      const exportData = {
        title: itinerary.title,
        duration: itinerary.durationDays,
        budget: itinerary.budget,
        intensity: itinerary.intensity,
        type: itinerary.type,
        days: []
      };
      
      // Group plans by day
      const plansByDay = {};
      for (const pi of planItineraries) {
        if (!plansByDay[pi.dayNumber]) {
          plansByDay[pi.dayNumber] = [];
        }
        plansByDay[pi.dayNumber].push(pi.planId);
      }
      
      // Format days
      for (let i = 1; i <= itinerary.durationDays; i++) {
        const dayPlans = plansByDay[i] || [];
        exportData.days.push({
          dayNumber: i,
          plans: dayPlans
        });
      }
      
      // Return data in requested format
      let result;
      switch (format.toLowerCase()) {
        case 'json':
          result = JSON.stringify(exportData);
          break;
        case 'pdf':
          // This would use a PDF generation library
          result = 'PDF data would be generated here';
          break;
        default:
          result = JSON.stringify(exportData);
      }
      
      return {
        success: true,
        data: result,
        format
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

class Plan {
  constructor(id, breakfastRestaurantId, lunchRestaurantId, dinnerRestaurantId, startTime, endTime) {
    this.id = id;
    this.breakfastRestaurantId = breakfastRestaurantId;
    this.lunchRestaurantId = lunchRestaurantId;
    this.dinnerRestaurantId = dinnerRestaurantId;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  // Create a new plan
  static async createPlan(planData) {
    try {
      const newPlan = new PlanModel({
        breakfastRestaurantId: planData.breakfastRestaurantId,
        lunchRestaurantId: planData.lunchRestaurantId,
        dinnerRestaurantId: planData.dinnerRestaurantId,
        startTime: planData.startTime,
        endTime: planData.endTime
      });
      
      const savedPlan = await newPlan.save();
      
      return {
        success: true,
        plan: savedPlan
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Add item to plan
  static async addPlanItem(planId, locationId, activityId, order, durationMins) {
    try {
      const newPlanItem = new PlanItemModel({
        planId,
        locationId,
        activityId,
        order,
        durationMins
      });
      
      const savedPlanItem = await newPlanItem.save();
      
      return {
        success: true,
        planItem: savedPlanItem
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Calculate total duration of a plan
  static async calculateTotalDuration(planId) {
    try {
      const planItems = await PlanItemModel.find({ planId });
      
      if (!planItems || planItems.length === 0) {
        return { success: true, totalDuration: 0 };
      }
      
      const totalMinutes = planItems.reduce((total, item) => total + item.durationMins, 0);
      
      return {
        success: true,
        totalDuration: totalMinutes
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get restaurants for a plan
  static async getRestaurants(planId) {
    try {
      const plan = await PlanModel.findById(planId);
      
      if (!plan) {
        throw new Error('Plan not found');
      }
      
      // Get all restaurant IDs from the plan
      const restaurantIds = [
        plan.breakfastRestaurantId,
        plan.lunchRestaurantId,
        plan.dinnerRestaurantId
      ].filter(id => id); // Filter out null/undefined
      
      // Fetch restaurant details
      const restaurants = await RestaurantModel.find({
        _id: { $in: restaurantIds }
      }).populate('locationId');
      
      return {
        success: true,
        restaurants: restaurants.map(r => ({
          id: r._id,
          name: r.locationId.name,
          cuisine: r.cuisine,
          priceSymbols: r.priceSymbols,
          address: r.locationId.address,
          imageUrl: r.locationId.imageUrl
        }))
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Rate a plan
  static async ratePlan(planId, userId, rating, comment) {
    try {
      // Check if user has already rated this plan
      const existingRating = await PlanRatingModel.findOne({
        planId,
        userId
      });
      
      if (existingRating) {
        // Update existing rating
        existingRating.rating = rating;
        existingRating.comment = comment;
        await existingRating.save();
      } else {
        // Create new rating
        const newRating = new PlanRatingModel({
          planId,
          userId,
          rating,
          comment,
          createdAt: new Date()
        });
        
        await newRating.save();
      }
      
      // Update average rating on plan
      const ratings = await PlanRatingModel.find({ planId });
      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      
      await PlanModel.findByIdAndUpdate(
        planId,
        { $set: { averageRating: averageRating.toFixed(1) } }
      );
      
      return { success: true, message: 'Plan rated successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Recommend plan to another user
  static async recommendPlan(planId, fromUserId, toUserId) {
    try {
      // Create recommendation
      const recommendation = new PlanRecommendationModel({
        planId,
        fromUserId,
        toUserId,
        status: 'pending',
        createdAt: new Date()
      });
      
      await recommendation.save();
      
      // Send notification to recipient
      const fromUser = await UserModel.findById(fromUserId);
      const plan = await PlanModel.findById(planId);
      
      if (fromUser && plan) {
        await Notification.sendNotification(
          toUserId,
          `${fromUser.username} has recommended a plan to you: "${plan.title}"`,
          'recommendation'
        );
      }
      
      return { success: true, message: 'Plan recommended successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get most booked plans
  static async getMostBookedPlan(limit = 5) {
    try {
      // Aggregate plans by reservation count
      const popularPlans = await ReservationModel.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: '$planId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);
      
      // Fetch plan details
      const planIds = popularPlans.map(p => p._id);
      const plans = await PlanModel.find({
        _id: { $in: planIds }
      }).populate('breakfastRestaurantId lunchRestaurantId dinnerRestaurantId');
      
      return {
        success: true,
        plans
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Generate a plan based on preferences
  static async generatePlan(preferences) {
    try {
      // Example algorithm to generate a plan based on user preferences
      // This would be more sophisticated in a real app
      
      const { cuisine, priceRange, activityTypes, intensity } = preferences;
      
      // Find breakfast restaurant
      const breakfastRestaurant = await RestaurantModel.findOne({
        cuisine: { $in: cuisine },
        priceSymbols: { $lte: priceRange }
      }).sort('averageRating');
      
      // Find lunch restaurant
      const lunchRestaurant = await RestaurantModel.findOne({
        cuisine: { $in: cuisine },
        priceSymbols: { $lte: priceRange },
        _id: { $ne: breakfastRestaurant?._id }
      }).sort('averageRating');
      
      // Find dinner restaurant
      const dinnerRestaurant = await RestaurantModel.findOne({
        cuisine: { $in: cuisine },
        priceSymbols: { $lte: priceRange },
        _id: { $nin: [breakfastRestaurant?._id, lunchRestaurant?._id] }
      }).sort('averageRating');
      
      // Create a new plan
      const newPlan = new PlanModel({
        breakfastRestaurantId: breakfastRestaurant?._id,
        lunchRestaurantId: lunchRestaurant?._id,
        dinnerRestaurantId: dinnerRestaurant?._id,
        startTime: '08:00',
        endTime: '22:00'
      });
      
      const savedPlan = await newPlan.save();
      
      // Find activities based on preferences
      const activities = await ActivityModel.find({
        type: { $in: activityTypes },
        difficulty: intensity
      }).limit(3);
      
      // Add activities to plan
      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        await Plan.addPlanItem(
          savedPlan._id,
          activity.locationId,
          activity._id,
          i + 1,
          activity.durationMins
        );
      }
      
      return {
        success: true,
        plan: savedPlan
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

class Location {
  constructor(id, name, type, description, address, city, country, latitude, longitude, openingHours, imageUrl) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.description = description;
    this.address = address;
    this.city = city;
    this.country = country;
    this.latitude = latitude;
    this.longitude = longitude;
    this.openingHours = openingHours;
    this.imageUrl = imageUrl;
  }

  // Create a new location
  static async createLocation(locationData) {
    try {
      const newLocation = new LocationModel({
        name: locationData.name,
        type: locationData.type,
        description: locationData.description,
        address: locationData.address,
        city: locationData.city,
        country: locationData.country,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        openingHours: locationData.openingHours,
        imageUrl: locationData.imageUrl
      });
      
      const savedLocation = await newLocation.save();
      
      return {
        success: true,
        location: savedLocation
      };
    }catch{
        console.log("Tsatya rah msti")
    }
}
}




  
  class Reservation {
    constructor(id, userId, itineraryId, itemId, startDate, endDate, status, price) {
      this.id = id;
      this.userId = userId;
      this.itineraryId = itineraryId;
      this.itemId = itemId;
      this.startDate = startDate;
      this.endDate = endDate;
      this.status = status || 'pending';
      this.price = price;
    }
  
    makeReservation() {
      this.status = 'confirmed';
      console.log(`Reservation ${this.id} has been made`);
      return true;
    }
  
    cancelReservation() {
      this.status = 'cancelled';
      console.log(`Reservation ${this.id} has been cancelled`);
      return true;
    }
  
    updateStatus(status) {
      this.status = status;
      console.log(`Reservation ${this.id} status updated to ${status}`);
    }
  }
  
  class Notification {
    constructor(id, userId, message, type, status) {
      this.id = id;
      this.userId = userId;
      this.message = message;
      this.type = type;
      this.status = status || 'unread';
      this.createdAt = new Date();
    }
  
    sendNotification() {
      console.log(`Notification sent to user ${this.userId}: ${this.message}`);
    }
  
    markAsRead() {
      this.status = 'read';
      console.log(`Notification ${this.id} marked as read`);
    }
  
    static scheduleNotification(time, message, userId, type) {
      console.log(`Notification scheduled for ${time}: ${message}`);
      // Implementation to schedule notification
    }
  }
  
  class Hotel {
    constructor(id, locationId, starRating, amenities, priceTier, contactInfo) {
      this.id = id;
      this.locationId = locationId;
      this.starRating = starRating;
      this.amenities = amenities || {};
      this.priceTier = priceTier;
      this.contactInfo = contactInfo;
    }
  
    getHotelDetails() {
      console.log(`Fetching details for hotel ${this.id}`);
      return JSON.stringify(this);
    }
  
    static searchHotel(criteria) {
      console.log(`Searching for hotels with criteria: ${JSON.stringify(criteria)}`);
      return []; // Returns list of Hotel objects
    }
  }
  
  class Restaurant {
    constructor(id, locationId, cuisine, priceSymbols, dietaryTags, contactInfo) {
      this.id = id;
      this.locationId = locationId;
      this.cuisine = cuisine;
      this.priceSymbols = priceSymbols;
      this.dietaryTags = dietaryTags || {};
      this.contactInfo = contactInfo;
    }
  
    getRestaurantDetails() {
      console.log(`Fetching details for restaurant ${this.id}`);
      return JSON.stringify(this);
    }
  
    static searchRestaurant(criteria) {
      console.log(`Searching for restaurants with criteria: ${JSON.stringify(criteria)}`);
      return []; // Returns list of Restaurant objects
    }
  
    getReviews() {
      console.log(`Fetching reviews for restaurant ${this.id}`);
      return []; // Returns list of Review objects
    }
  }
  
  class Activity {
    constructor(id, locationId, name, type, durationMins, price, imageUrl, difficulty, minAge, contactInfo) {
      this.id = id;
      this.locationId = locationId;
      this.name = name;
      this.type = type;
      this.durationMins = durationMins;
      this.price = price;
      this.imageUrl = imageUrl;
      this.difficulty = difficulty;
      this.minAge = minAge;
      this.contactInfo = contactInfo;
    }
  
    getActivityDetails() {
      console.log(`Fetching details for activity ${this.id}`);
      return JSON.stringify(this);
    }
  
    static searchActivities(criteria) {
      console.log(`Searching for activities with criteria: ${JSON.stringify(criteria)}`);
      return []; // Returns list of Activity objects
    }
  
    static getActivitiesVisitedByFriends(userId) {
      console.log(`Finding activities visited by friends of user ${userId}`);
      return []; // Returns list of Activity objects
    }
  
    getSimilarActivities() {
      console.log(`Finding activities similar to ${this.id}`);
      return []; // Returns list of Activity objects
    }
  }
  
  class Review {
    constructor(id, userId, locationId, activityId, rating, comment) {
      this.id = id;
      this.userId = userId;
      this.locationId = locationId;
      this.activityId = activityId;
      this.rating = rating;
      this.comment = comment;
      this.createdAt = new Date();
    }
  
    submitReview() {
      console.log(`Review ${this.id} submitted by user ${this.userId}`);
    }
  
    updateReview(comment) {
      this.comment = comment;
      console.log(`Review ${this.id} updated`);
    }
  
    deleteReview() {
      console.log(`Review ${this.id} deleted`);
    }
  }
  
  class Transportation {
    constructor(id, fromLocationId, toLocationId, mode, durationMins, price, provider, notes) {
      this.id = id;
      this.fromLocationId = fromLocationId;
      this.toLocationId = toLocationId;
      this.mode = mode;
      this.durationMins = durationMins;
      this.price = price;
      this.provider = provider;
      this.notes = notes;
    }
  
    getTransportationDetails() {
      console.log(`Fetching details for transportation ${this.id}`);
      return JSON.stringify(this);
    }
  
    getAlternativeRoutes() {
      console.log(`Finding alternative routes for transportation ${this.id}`);
      return []; // Returns list of Transportation objects
    }
  }
  
  class Tag {
    constructor(id, name) {
      this.id = id;
      this.name = name;
    }
  
    getTagName() {
      return this.name;
    }
  }
  
  // ---------- Join and Association Classes ----------
  
  class UserItinerary {
    constructor(userId, itineraryId, role) {
      this.userId = userId;
      this.itineraryId = itineraryId;
      this.role = role || 'owner';
      this.addedAt = new Date();
    }
  
    assignRole(role) {
      this.role = role;
      console.log(`Role for user ${this.userId} updated to ${role} for itinerary ${this.itineraryId}`);
    }
  }
  
  class PlanItinerary {
    constructor(planId, itineraryId, dayNumber, note) {
      this.planId = planId;
      this.itineraryId = itineraryId;
      this.dayNumber = dayNumber;
      this.note = note || '';
    }
  
    addNote(note) {
      this.note = note;
      console.log(`Note added to plan ${this.planId} in itinerary ${this.itineraryId}`);
    }
  }
  
  class PlanItem {
    constructor(planId, locationId, activityId, order, durationMins) {
      this.planId = planId;
      this.locationId = locationId;
      this.activityId = activityId;
      this.order = order;
      this.durationMins = durationMins;
    }
  
    updateOrder(newOrder) {
      this.order = newOrder;
      console.log(`Order updated to ${newOrder} for plan item in plan ${this.planId}`);
    }
  }
  
  class LocationTag {
    constructor(locationId, tagId) {
      this.locationId = locationId;
      this.tagId = tagId;
    }
  
    addTag() {
      console.log(`Tag ${this.tagId} added to location ${this.locationId}`);
    }
  }
  
  // Helper function to generate unique IDs
  function generateId() {
    return Math.floor(Math.random() * 1000000);
  }
  
  // Example function to hash passwords
  function hashPassword(password) {
    // This would use a proper hashing library in a real application
    return `hashed_${password}`;
  }
  
  module.exports = {
    User,
    Itinerary,
    Plan,
    Location,
    Reservation,
    Notification,
    Hotel,
    Restaurant,
    Activity,
    Review,
    Transportation,
    Tag,
    UserItinerary,
    PlanItinerary,
    PlanItem,
    LocationTag
  };