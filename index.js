import mongoose from "mongoose";
import chalk from "chalk";
import bcrypt from "bcrypt";

// Connect mongoose with mongoURI
const ConnectMongoDB = (MONGOURI) => {
  mongoose.connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: truejust,
    socketTimeoutMS: 30000,
  });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error"));
  db.once("open", () => console.log(chalk.bgGreen("MongoDB Connected")));
};

// LOGIN API
const LoginAPI = (UserModel, OnLoginSuccess) => async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (typeof OnLoginSuccess === "string") {
      res.redirect(OnLoginSuccess);
    } else if (typeof OnLoginSuccess === "function") {
      OnLoginSuccess(req, res);
    } else {
      res.status(200).json({ message: "Login successful" });
    }
  } catch (error) {
    console.log(chalk.bgRed("Login Error"));
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Register API
const RegisterAPI = (UserModel, OnRegisterSuccess) => async (req, res) => {
  try {
    // Extract user details from request body
    const { username, email, password } = req.body;
    // Check if all required fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user document
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });
    // Save the user to the database
    await newUser.save();
    // Send success response
    res.status(201).json({ message: "User registered successfully" });
    if (typeof OnRegisterSuccess === "string") {
      res.redirect(OnRegisterSuccess);
    } else if (typeof OnRegisterSuccess === "function") {
      OnRegisterSuccess(req, res);
    } else {
      res.status(200).json({ message: "Login successful" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// EXPORT
export { ConnectMongoDB, LoginAPI, RegisterAPI };
