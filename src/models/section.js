const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  learningObjectives: { type: String },
  modules: {
    type: [moduleSchema],
  },
  description: { type: String, required: true },
  images: [{ type: String }],
});

module.exports = mongoose.model("Section", sectionSchema);
