const mongoose = require("mongoose");

async function connectDatabase() {
  await mongoose.connect(
    "mongodb+srv://deepakgargn031:Deep123@data.zco187n.mongodb.net/?retryWrites=true&w=majority&appName=Data/E-Commerce"
  );
}

module.exports = connectDatabase;
