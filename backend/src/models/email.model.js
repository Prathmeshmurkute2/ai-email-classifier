import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    gmailId: {
        type: String,
        unique: true,
        sparse: true, // Allows null/missing values for manually created/mock emails
    },
    subject: String,
    content: String, // email body
    sender: String,
    status: {
        type: String,
        enum: ["unread", "read"],
        default: "unread",
    },
    predictedLabel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
    },
    userAssignedLabel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
    },
    confidenceScore: {
        type: Number,
        default: 0.0,
    },
    receivedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

emailSchema.index({ userId: 1 });


export default mongoose.model("Email", emailSchema);