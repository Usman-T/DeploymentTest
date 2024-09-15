const mongoose = require("mongoose");

const enrolledSchema = new mongoose.Schema({
    name: {
        type: String
    }
});

module.exports = mongoose.model("Enrolled User", enrolledSchema);
