const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  options: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
    },
  ],
  votes: [
    {
      optionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Roadmap", 
      },
      count: { type: Number, default: 0 }, 
    },
  ],
});

module.exports = mongoose.model("Poll", pollSchema);
