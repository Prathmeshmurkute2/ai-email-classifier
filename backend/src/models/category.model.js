import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  color: {
    type: String,
    default: "#3b82f6", // Default Tailwind blue-500
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  isSystem: {
    type: Boolean,
    default: false,
  }

}, { timestamps: true });

// prevent duplicate labels per user
categorySchema.index({ name: 1, userId: 1 }, { unique: true });

// optional: faster queries
categorySchema.index({ userId: 1 });

// validation middleware
categorySchema.pre("save", function () {
  if (this.isSystem && this.userId !== null) {
    throw new Error("System categories must have userId = null");
  }
});

export default mongoose.model("Category", categorySchema);