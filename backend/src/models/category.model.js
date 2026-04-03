import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
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
categorySchema.pre("save", function (next) {
  if (this.isSystem && this.userId !== null) {
    return next(new Error("System categories must have userId = null"));
  }
  next();
});

export default mongoose.model("Category", categorySchema);