
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fname: { type: String, required: true, trim: true },
    lname: { type: String, required: true, trim: true },
    dob: String,
    gender: String,
    nationality: String,

    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    address: String,

    qualification: String,
    college: String,
    year: Number,
    percentage: String,

    photo: String,
    signature: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
