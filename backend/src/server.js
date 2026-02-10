import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB(process.env.MONGO_URI);

  app.listen(PORT, () => {
    console.log(`✅ Server running: http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Server failed:", err.message);
  process.exit(1);
});
