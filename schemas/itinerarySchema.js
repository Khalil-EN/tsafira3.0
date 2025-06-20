const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  destination: { type: String },
  country: { type: String },
  duration: { type: Number, required: true }, 
  budget: { type: Number, required: true },
  nbrOfPeople: { type: Number, required: true },    
  typeSuggestion: {
    type: String,
    enum: ['user', 'generated'],
    default: 'user'
  },
  typeItinerary: {
    type: String,
    enum: ['solo', 'couple', 'family', 'friends'],
    default: 'solo'
  },
  itineraryActivityPreferences: {
    type: [String],
    enum: ['museums', 'mountains', 'beach', 'gardens', 'cultural attractions', 'entertainment activities'],
    default: ['cultural attractions', 'entertainment activities']
  },
  residenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Residence' },
  plans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Itinerary", itinerarySchema);
