import axios from "axios";
import Email from "../models/email.model.js";

// @desc    Trigger ML model retraining
// @route   POST /api/ml/train
// @access  Private
export const trainModel = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Gather all emails that the user has manually labeled
    const labeledEmails = await Email.find({
      userId,
      userAssignedLabel: { $ne: null },
    }).populate("userAssignedLabel");

    if (labeledEmails.length < 3) {
      return res.status(400).json({
        success: false,
        message: `Insufficient training data. You need to label at least 3 emails (currently labeled: ${labeledEmails.length}).`,
      });
    }

    // 2. Prepare payload for the Python ML Service
    const trainingData = labeledEmails.map((email) => ({
      text: `${email.subject} ${email.content}`,
      label: email.userAssignedLabel.name, // the category name
    }));

    // Check if we have at least 2 distinct classes/categories
    const classes = [...new Set(trainingData.map((d) => d.label))];
    if (classes.length < 2) {
      return res.status(400).json({
        success: false,
        message: `ML training requires emails in at least 2 distinct categories. Currently labeled categories: ${classes.join(
          ", "
        ) || "None"}`,
      });
    }

    // 3. Post to Python ML microservice
    const mlUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:5000";
    
    console.log(`Sending ${trainingData.length} training items to Flask ML service: ${mlUrl}/train`);
    
    const response = await axios.post(`${mlUrl}/train`, {
      data: trainingData,
    });

    res.json({
      success: true,
      message: "AI model retrained successfully.",
      data: response.data,
    });
  } catch (error) {
    console.error("ML service training integration error:", error.message);
    
    let errMsg = "Could not communicate with the ML service. Make sure the Python Flask service is running.";
    if (error.response && error.response.data && error.response.data.message) {
      errMsg = error.response.data.message;
    }

    res.status(500).json({
      success: false,
      message: errMsg,
    });
  }
};
