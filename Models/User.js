import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Fields cannot be blanked"],
  },
  password: {
    type: String,
    required: [true, "Fields canot be blanked"],
  },
  role: {
    type: String,
    default: "User",
  },
});

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     next();
//   }
//   const hashedPass = bcrypt.hash(this.password, 10);
//   this.password = hashedPass;
// });

export default mongoose.model("User", userSchema);
