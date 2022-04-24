const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    movie: {type: String},
    reviewer: {type: String},
    quote: {type: String},
    rating: {type: Number, min: 1, max: 5},
});

module.exports = mongoose.model("Review", ReviewSchema);
