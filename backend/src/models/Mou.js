import mongoose from "mongoose";

const mouSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Mou", mouSchema);
