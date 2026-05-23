import { google } from "googleapis";
import axios from "axios";
import Email from "../models/email.model.js";
import Category from "../models/category.model.js";
import User from "../models/user.model.js";

// Helper to get Google OAuth2 Client
const getOAuth2Client = (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback"
  );
  oauth2Client.setCredentials(user.googleTokens);
  return oauth2Client;
};

// Helper to predict category using Flask ML Service
const getPredictionFromML = async (emailText) => {
  try {
    const mlUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:5000";
    const response = await axios.post(`${mlUrl}/predict`, { text: emailText });
    return response.data; // Expected: { success: true, prediction: "college", confidence: 0.85 }
  } catch (error) {
    // If Flask app isn't running or error occurs, log and fail gracefully
    console.error("ML prediction endpoint error:", error.message);
    return { success: false, prediction: null, confidence: 0 };
  }
};

const MOCK_EMAILS = [
  {
    gmailId: "mock_1",
    sender: "admissions@university.edu",
    subject: "Fall Semester Course Registration Guidelines",
    content: "Dear Student, course registration for the Fall semester starts next week. Please select your elective subjects, including DSA, Web Dev, and System Design before the deadline."
  },
  {
    gmailId: "mock_2",
    sender: "careers@techcorp.com",
    subject: "Software Engineering Internship Offer",
    content: "Congratulations! We are pleased to offer you a Software Engineering Internship position at TechCorp. Please review the offer letter and return a signed copy."
  },
  {
    gmailId: "mock_3",
    sender: "billing@utilitycompany.com",
    subject: "Monthly Electricity Bill - Payment Due",
    content: "Your electricity bill for the current billing cycle is ready. The total amount due is $124.50. Please make the payment by the end of this week to avoid late fees."
  },
  {
    gmailId: "mock_4",
    sender: "mom@familymail.com",
    subject: "Weekend family dinner plans",
    content: "Hey honey, just checking in. Are you coming over for Sunday dinner? I'm planning to cook your favorite lasagna. Let me know by Friday!"
  },
  {
    gmailId: "mock_5",
    sender: "geeksforgeeks@newsletter.com",
    subject: "Daily Coding Challenge: Solve 'Merge K Sorted Lists'",
    content: "Improve your Data Structures & Algorithms (DSA) skills with today's problem. Solve 'Merge K Sorted Lists' using min-heap. Level: Hard. Check out the solution."
  },
  {
    gmailId: "mock_6",
    sender: "hiring@startup.io",
    subject: "Invitation to Technical Interview",
    content: "Hi, we received your application for the Full Stack Developer role. We would love to invite you for a 45-minute technical interview focusing on React and Node.js."
  },
  {
    gmailId: "mock_7",
    sender: "chase@alert.chase.com",
    subject: "Transaction Alert: Chase Credit Card",
    content: "A charge of $45.00 was authorized on your Chase credit card ending in 1234 at Star Coffee on May 23. If this was not you, please contact support immediately."
  }
];

// @desc    Sync / Fetch emails (Gmail API or Mock data fallback)
// @route   POST /api/emails/sync
// @access  Private
export const syncEmails = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const useMock = req.body.mock === true || !user.googleTokens || !user.googleTokens.refresh_token;
    let fetchedEmails = [];

    if (useMock) {
      console.log("Using Mock Emails for User:", user.email);
      fetchedEmails = MOCK_EMAILS.map((email, idx) => ({
        ...email,
        gmailId: `${email.gmailId}_${userId}`, // Scoped to user to allow multiple mock tests
        receivedAt: new Date(Date.now() - idx * 24 * 60 * 60 * 1000), // Spaced days ago
      }));
    } else {
      console.log("Connecting to Gmail API for User:", user.email);
      try {
        const oauth2Client = getOAuth2Client(user);
        const gmail = google.gmail({ version: "v1", auth: oauth2Client });

        // Retrieve the latest 15 email threads
        const listResponse = await gmail.users.messages.list({
          userId: "me",
          maxResults: 15,
          q: "-category:promotions -category:social", // Focus on main emails
        });

        const messages = listResponse.data.messages || [];

        for (const message of messages) {
          const detailResponse = await gmail.users.messages.get({
            userId: "me",
            id: message.id,
            format: "full",
          });

          const msg = detailResponse.data;
          const headers = msg.payload.headers;

          const subjectHeader = headers.find((h) => h.name === "Subject");
          const fromHeader = headers.find((h) => h.name === "From");
          const dateHeader = headers.find((h) => h.name === "Date");

          const subject = subjectHeader ? subjectHeader.value : "No Subject";
          const sender = fromHeader ? fromHeader.value : "Unknown Sender";
          const dateVal = dateHeader ? new Date(dateHeader.value) : new Date();

          // Extract text body
          let content = "";
          if (msg.payload.parts) {
            // Multipart email
            const textPart = msg.payload.parts.find((p) => p.mimeType === "text/plain");
            if (textPart && textPart.body && textPart.body.data) {
              content = Buffer.from(textPart.body.data, "base64").toString("utf-8");
            } else {
              // Fallback to html part or description
              const htmlPart = msg.payload.parts.find((p) => p.mimeType === "text/html");
              if (htmlPart && htmlPart.body && htmlPart.body.data) {
                content = Buffer.from(htmlPart.body.data, "base64")
                  .toString("utf-8")
                  .replace(/<[^>]*>/g, ""); // basic HTML tag stripping
              }
            }
          } else if (msg.payload.body && msg.payload.body.data) {
            // Simple body
            content = Buffer.from(msg.payload.body.data, "base64").toString("utf-8");
          }

          if (!content) {
            content = msg.snippet || "Empty content";
          }

          fetchedEmails.push({
            gmailId: msg.id,
            subject,
            sender,
            content,
            receivedAt: dateVal,
          });
        }
      } catch (gmailErr) {
        console.error("Gmail API Error, falling back to Mock emails:", gmailErr.message);
        // Fallback to Mock emails if Google API fails (e.g. token expired, scopes invalid)
        fetchedEmails = MOCK_EMAILS.map((email, idx) => ({
          ...email,
          gmailId: `${email.gmailId}_${userId}`,
          receivedAt: new Date(Date.now() - idx * 24 * 60 * 60 * 1000),
        }));
      }
    }

    const savedEmails = [];

    for (const emailData of fetchedEmails) {
      // 1. Check for duplicates in DB
      let email = await Email.findOne({ userId, gmailId: emailData.gmailId });

      if (!email) {
        // 2. Fetch ML prediction
        const mlRes = await getPredictionFromML(`${emailData.subject} ${emailData.content}`);
        
        let predictedLabelId = null;
        let confidenceScore = 0;

        if (mlRes.success && mlRes.prediction) {
          // Look up corresponding category in MongoDB for this user (or system default)
          const categoryName = mlRes.prediction.trim().toLowerCase();
          let category = await Category.findOne({
            name: categoryName,
            $or: [{ userId }, { isSystem: true }],
          });

          if (!category) {
            // Create a custom category automatically if prediction returned a label that exists in the ML but not DB
            category = await Category.create({
              name: categoryName,
              userId,
              isSystem: false,
              color: "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'), // Random color
            });
          }
          predictedLabelId = category._id;
          confidenceScore = mlRes.confidence;
        }

        // 3. Create email record
        email = await Email.create({
          userId,
          gmailId: emailData.gmailId,
          subject: emailData.subject,
          sender: emailData.sender,
          content: emailData.content,
          receivedAt: emailData.receivedAt,
          predictedLabel: predictedLabelId,
          confidenceScore,
        });
      }
      savedEmails.push(email);
    }

    // Return populated list of user's emails
    const emails = await Email.find({ userId })
      .populate("predictedLabel")
      .populate("userAssignedLabel")
      .sort({ receivedAt: -1 });

    res.json({
      success: true,
      message: `Successfully synchronized ${fetchedEmails.length} emails.`,
      data: emails,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user emails
// @route   GET /api/emails
// @access  Private
export const getEmails = async (req, res) => {
  try {
    const userId = req.user.id;
    const emails = await Email.find({ userId })
      .populate("predictedLabel")
      .populate("userAssignedLabel")
      .sort({ receivedAt: -1 });

    res.json({ success: true, data: emails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manually assign/relabel an email
// @route   PUT /api/emails/:id/label
// @access  Private
export const relabelEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const emailId = req.params.id;
    const { categoryId } = req.body; // Can be null if removing label

    const email = await Email.findOne({ _id: emailId, userId });

    if (!email) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    if (categoryId) {
      const category = await Category.findOne({
        _id: categoryId,
        $or: [{ userId }, { isSystem: true }],
      });

      if (!category) {
        return res.status(400).json({ success: false, message: "Invalid Category ID" });
      }

      email.userAssignedLabel = category._id;
    } else {
      email.userAssignedLabel = null;
    }

    await email.save();

    const updatedEmail = await Email.findById(emailId)
      .populate("predictedLabel")
      .populate("userAssignedLabel");

    res.json({
      success: true,
      message: "Email label updated successfully.",
      data: updatedEmail,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Dashboard statistics
// @route   GET /api/emails/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalEmails = await Email.countDocuments({ userId });
    
    // Count manual labels
    const manuallyLabeled = await Email.countDocuments({
      userId,
      userAssignedLabel: { $ne: null },
    });

    // Count automatically classified (with ML prediction)
    const autoClassified = await Email.countDocuments({
      userId,
      predictedLabel: { $ne: null },
      userAssignedLabel: null,
    });

    // Calculate Average ML Confidence
    const confidenceAgg = await Email.aggregate([
      { $match: { userId, predictedLabel: { $ne: null } } },
      { $group: { _id: null, avgConfidence: { $avg: "$confidenceScore" } } },
    ]);
    const averageConfidence = confidenceAgg.length > 0 ? confidenceAgg[0].avgConfidence : 0;

    // Calculate Accuracy: percentage of predictions that match user selections, or are not overridden
    const overridesCount = await Email.countDocuments({
      userId,
      userAssignedLabel: { $ne: null },
      $expr: { $ne: ["$predictedLabel", "$userAssignedLabel"] },
    });

    const correctPredictions = totalEmails > 0 ? (totalEmails - overridesCount) : 0;
    const accuracy = totalEmails > 0 ? (correctPredictions / totalEmails) : 1;

    // Categories breakdown
    // We group emails by category, resolving final label (user-assigned overrides predict)
    const emails = await Email.find({ userId })
      .populate("predictedLabel")
      .populate("userAssignedLabel");

    const categoryBreakdown = {};

    for (const email of emails) {
      const finalLabelObj = email.userAssignedLabel || email.predictedLabel;
      const labelName = finalLabelObj ? finalLabelObj.name : "uncategorized";
      
      if (!categoryBreakdown[labelName]) {
        categoryBreakdown[labelName] = {
          count: 0,
          color: finalLabelObj ? finalLabelObj.color : "#9ca3af",
        };
      }
      categoryBreakdown[labelName].count += 1;
    }

    res.json({
      success: true,
      data: {
        totalEmails,
        manuallyLabeled,
        autoClassified,
        averageConfidence: Number(averageConfidence.toFixed(2)),
        accuracy: Number((accuracy * 100).toFixed(1)),
        categoryBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
