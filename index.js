import mongoose from "mongoose";
import chalk from "chalk";
import bcrypt from "bcrypt";

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

// LOGIN API  REST api
const LoginAPI = async (LoginRoute, UserModel, server_name) => {
  let User = UserModel;
  server_name.post(LoginRoute, async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }
      console.log(req.body);
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      return res.status(200).json({ message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
};

// EXPORT
export { ConnectMongoDB, LoginAPI };
