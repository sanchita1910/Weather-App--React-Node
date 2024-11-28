const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

favoriteSchema.index({ city: 1, state: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
