const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  itineraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary', required: true },
  dayNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },

  
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],

  // Transportation method
  //transportation: { type: String },

  
  meals: [
    {
      type: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
      restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }
    }
  ],

  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Plan", planSchema);
