const mongoose = require("mongoose");

const roadmapSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  sections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  draft: { type: Boolean, default: true },
});

module.exports = mongoose.model("Roadmap", roadmapSchema);
