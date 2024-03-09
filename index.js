import mongoose from "mongoose";
import chalk from "chalk";
// import bcrypt from "bcrypt";

// Connect mongoose with mongoURI
const ConnectMongoDB = (MONGOURI) => {
  mongoose.connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000,
  });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error"));
  db.once("open", () => console.log(chalk.bgGreen("MongoDB Connected")));
};

// EXPORT
export { ConnectMongoDB, LoginAPI };
