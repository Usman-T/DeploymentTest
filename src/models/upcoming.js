const mongoose = require("mongoose");

const schema = mongoose.schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Upcoming", schema);
