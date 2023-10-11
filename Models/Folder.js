import mongoose from "mongoose";
import bcrypt from "bcrypt";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    content: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File", // This references the "File" model
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Folder", folderSchema);
