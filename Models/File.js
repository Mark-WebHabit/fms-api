import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ext: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      require: true,
    },
    content: {
      type: String,
      default: "",
    },
    absPath: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);
