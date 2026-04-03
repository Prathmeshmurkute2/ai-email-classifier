import mongoose from 'mongoose'


const classificationSchema = new mongoose.Schema({
  emailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Email",
    required: true,
  },

  predictedCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  finalCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  confidence: Number,

  isOverridden: {
    type: Boolean,
    default: false,
  },

  modelVersion: {
    type: String,
    default: "v1",
  }

}, { timestamps: true });


export default mongoose.model("Classification", classificationSchema);