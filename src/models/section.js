const mongoose = require("mongoose");

const module = mongoose.Schema({
  title: String,
  content: String,
  resources: [String],
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  learningObjectives: { type: String },
  modules: {
    type: [module.section.schema],
  },
  description: { type: String, required: true },
  images: [{ type: String }],
});

module.exports = mongoose.model("Section", sectionSchema);
