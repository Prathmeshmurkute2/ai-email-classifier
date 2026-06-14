# SmartMail AI - Intelligent Inbox Assistant

🚀 Live Demo: https://sortmailai.vercel.app

🌐 Backend API: https://ai-email-classifier-ola8.onrender.com

🤖 ML Service: https://ai-email-classifier-6264.onrender.com

📂 GitHub Repository: https://github.com/Prathmeshmurkute2/ai-email-classifier

SmartMail AI is a production-style, personalized email classification platform. It connects to Gmail, fetches messages, allows you to create custom categories, and uses a machine learning classifier to learn your labeling behavior and automatically categorize incoming emails in real-time.

---

## System Architecture Overview

SmartMail AI consists of four primary components:

1. **Frontend (React + Tailwind CSS v4 + Axios)**
   - Located in: `frontend/`
   - Serves the dashboard UI: folders, custom labels list with visual tags, email listings, and stats.
   - Communicates with the backend server via Axios using JSON Web Tokens (JWT) for authentication.

2. **Backend Server (Node.js + Express.js + Mongoose)**
   - Located in: `backend/`
   - Manages CRUD operations for categories/labels, user auth, and email databases.
   - Integrates with Google OAuth2 for Gmail fetching, and proxies machine learning retraining or inference payloads to the Python ML microservice.

3. **Database (MongoDB Atlas)**
   - Configured in the backend via Mongoose.
   - Stores users, categories, classification schemas, and email bodies securely.

4. **Machine Learning Service (Python + Flask + Scikit-Learn)**
   - Located in: `ml-service/`
   - Runs text preprocessing (HTML stripping, stopword removal) and extracts features using a TF-IDF Vectorizer.
   - Fits a Multinomial Naive Bayes model on user-labeled emails, persisting model files (`model.pkl`, `vectorizer.pkl`) to disk for fast real-time inference.

---

## Detailed Step-by-Step Installation

### Phase 1: Machine Learning Microservice Setup
To run the ML microservice, ensure Python (3.8+) is installed.

1. Navigate to the `ml-service` directory.
2. Initialize and install dependencies. We've included a Windows batch file for easy setup:
   - Double-click **`setup_env.bat`** (or run `./setup_env.bat` in command prompt).
   - This automatically creates a virtual environment (`venv`) and installs `Flask`, `scikit-learn`, `pandas`, `numpy`, `joblib`, and `nltk`.
3. Launch the microservice:
   - Double-click **`start_server.bat`** (or run `python app.py` from the activated environment).
   - The ML service will start running on `http://127.0.0.1:5000`.

### Phase 2: Node.js Backend Server Setup
Ensure Node.js (v18+) is installed.

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install the backend node modules:
   ```bash
   npm install
   ```
3. The database URI is already pre-configured in `.env`.
4. Run the backend development server:
   ```bash
   npm run dev
   ```
   - The server will start running on port `3000` (`http://localhost:3000`).

### Phase 3: React Frontend Setup
1. Open a terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install the frontend package dependencies:
   ```bash
   npm install
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   ```
   - The React client will start running on port `5173` (`http://localhost:5173`).

---

## How to Test the Classification Workflow

1. Open your browser and navigate to `http://localhost:5173`.
2. **Sign Up**: Create a new account with your name, email, and password.
3. **Toggle Modes**:
   - The system is equipped with **Mock Mode** by default (which works offline and fetches a mock email set).
   - To connect real emails, configure your Google OAuth application details in `backend/.env` and toggle **Live Gmail** to link your account.
4. **Synchronize Emails**:
   - Click the **Sync Mail** button at the top. This fetches recent emails and stores them in MongoDB.
   - Initially, since no ML model has been trained, all emails will show as **Uncategorized**.
5. **Create Custom Labels**:
   - In the sidebar, click the `+` icon next to "Custom Labels".
   - Create some categories matching your emails, for example:
     - `College` (e.g., Red)
     - `Internship` (e.g., Emerald)
     - `Finance` (e.g., Amber)
     - `Family` (e.g., Pink)
     - `DSA` (e.g., Purple)
6. **Manually Override Labels (Create Labeled Training Set)**:
   - Click on an email card to open it.
   - Use the **Tag** icon or dropdown reclassify badge to classify at least 3 emails manually across at least 2 distinct categories (e.g., label a college email as `College` and an offer letter as `Internship`).
7. **Train the AI Model**:
   - Click the **Train AI Model** button at the top toolbar.
   - The backend retrieves the labeled emails, sends them to the Python microservice, and saves the trained classifier.
8. **Test Automatic Classification**:
   - Clear your email set in MongoDB (or sync a new user set).
   - Sync emails again. You will see that the new incoming emails are now automatically labeled by the AI with a confidence score!
   - You can review and correct any predictions, and retraining the model will continuously improve its accuracy.
