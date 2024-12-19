import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  membership_status: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'librarian'],  // Correct way to define enum in Mongoose
    required: true,
    default: 'user',
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
