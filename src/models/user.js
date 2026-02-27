// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     role: {
//       type: String,
//       enum: ["seller", "recycler", "admin"], 
//       default: "seller",                     
//     },
//   },
//   { timestamps: true }
// );

// module.exports =
//   mongoose.models.User || mongoose.model("User", userSchema);




const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      // Optional: add match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number"]
    },
    location: {
      type: String,
      required: true,
      trim: true,
      // e.g. "Kampala, Uganda" or "Ikeja, Lagos"
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      // select: false  // hide in queries (optional, but good practice)
    },
    role: {
      type: String,
      enum: ["seller", "recycler", "admin"],
      default: "seller",
      required: true,
    },
  },
  { timestamps: true }
);





// Optional: don't return password in toJSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);