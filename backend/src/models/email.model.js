import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true,
    },
    subject:String,
    body:String,
    sender:String,

    status: {
        type:String,
        enum: ["unread", "read"],
        default: "unread";
    },

    receivedAt:{
        type: Date,
        default:Date.now,
    },
}, { timestamps:true });

emailSchema.index({ userId:1 });

export default mongoose.model("Email", emailSchema)