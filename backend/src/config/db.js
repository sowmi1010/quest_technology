import mongoose from "mongoose";

function normalizeUri(value) {
  return String(value || "").trim();
}

export async function connectDB(uri) {
  mongoose.set("strictQuery", true);

  const mongoUri = normalizeUri(uri);
  if (!mongoUri) {
    throw new Error("MONGO_URI is required.");
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10_000,
  });
  console.log("✅ MongoDB connected");
}
