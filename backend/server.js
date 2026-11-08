const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const app = require("./app");

const connectDB = require("./config/db.js");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    
    await connectDB();

    app.listen(PORT, () => {
      console.log("Server is running on PORT", PORT);
    });

  } catch (error) {
    console.error("Server Startup failed:", error.message);
    process.exit(1);
  }
};

startServer();