const { check } = require("express-validator");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const taskSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  userData: [
    {
      task: {
        type: String,
        required: true,
      },
      id: {
        type: Number,
        required: true,
      },
      src: {
        type: String,
      },
      check: {
        type: Boolean,
        default: false,
      },
    },
  ],
});
const User = mongoose.model("User", userSchema);

const Task = mongoose.model("Task", taskSchema);
module.exports = { User, Task };
