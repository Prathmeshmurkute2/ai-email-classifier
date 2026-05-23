import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import EmailCard from "../components/EmailCard";
import DashboardStats from "../components/DashboardStats";
import { api, useAuth } from "../context/AuthContext";
import {
  Search,
  RefreshCw,
  BrainCircuit,
  Maximize2,
  X,
  Mail,
  Loader2,
  Sparkles,
  Wifi,
  WifiOff,
  User,
  ShieldCheck,
  Tag,
  AlertCircle
} from "lucide-react";

const Dashboard = () => {
  const { connectGoogle, user } = useAuth();
  
  const [emails, setEmails] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeMailbox, setActiveMailbox] = useState("all");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [useMock, setUseMock] = useState(true); // Default to mock for easy testing
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showDetailPicker, setShowDetailPicker] = useState(false);

  // Auto-close detail picker if the active email details view changes
  useEffect(() => {
    setShowDetailPicker(false);
  }, [selectedEmail]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [emailRes, catRes, statsRes] = await Promise.all([
        api.get("/emails"),
        api.get("/categories"),
        api.get("/emails/stats"),
      ]);
      
      setEmails(emailRes.data.data);
      setCategories(catRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error("Error loading dashboard data:", err.message);
      setErrorMsg("Failed to load dashboard data. Ensure MongoDB and server are running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Display alert feedback briefly
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleCreateCategory = async (name, color) => {
    try {
      const res = await api.post("/categories", { name, color });
      if (res.data.success) {
        setCategories([...categories, res.data.data]);
        setSuccessMsg(`Category "${name}" created successfully.`);
        // Reload stats
        const statsRes = await api.get("/emails/stats");
        setStats(statsRes.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create category.");
    }
  };

  const handleSyncEmails = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await api.post("/emails/sync", { mock: useMock });
      if (res.data.success) {
        setEmails(res.data.data);
        setSuccessMsg(res.data.message || "Emails synced successfully.");
        // Refetch stats
        const statsRes = await api.get("/emails/stats");
        setStats(statsRes.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to fetch emails.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLabel = async (emailId, categoryId) => {
    try {
      const res = await api.put(`/emails/${emailId}/label`, { categoryId });
      if (res.data.success) {
        // Update local email list
        setEmails(emails.map((e) => (e._id === emailId ? res.data.data : e)));
        
        // Update currently opened email details if matching
        if (selectedEmail?._id === emailId) {
          setSelectedEmail(res.data.data);
        }

        // Refetch stats
        const statsRes = await api.get("/emails/stats");
        setStats(statsRes.data.data);
        setSuccessMsg("Email classified manually. The AI model can now be retrained on this sample.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update label.");
    }
  };

  const handleTrainModel = async () => {
    setTrainingLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await api.post("/ml/train");
      if (res.data.success) {
        setSuccessMsg("AI Model retrained successfully! Future email classification will be smarter.");
        // Update stats
        const statsRes = await api.get("/emails/stats");
        setStats(statsRes.data.data);
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "retraining failed. Do you have at least 3 labeled emails across 2 categories?"
      );
    } finally {
      setTrainingLoading(false);
    }
  };

  // Filtering Logic
  const filteredEmails = emails.filter((email) => {
    // 1. Label filter
    if (selectedCategory) {
      const finalCat = email.userAssignedLabel || email.predictedLabel;
      if (finalCat?._id !== selectedCategory._id) {
        return false;
      }
    }

    // 2. Mailbox filter
    if (activeMailbox === "inbox") {
      // Show unread emails in inbox
      if (email.status !== "unread") {
        return false;
      }
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const subjectMatch = email.subject?.toLowerCase().includes(query);
      const senderMatch = email.sender?.toLowerCase().includes(query);
      const contentMatch = email.content?.toLowerCase().includes(query);
      return subjectMatch || senderMatch || contentMatch;
    }

    return true;
  });

  return (
    <div className="h-screen bg-[#070a13] flex text-slate-100 overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onCreateCategory={handleCreateCategory}
        activeMailbox={activeMailbox}
        setActiveMailbox={setActiveMailbox}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070a13]">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 bg-[#0c1322]">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold text-white capitalize">
              {selectedCategory ? `${selectedCategory.name} Category` : activeMailbox === "inbox" ? "Inbox (Unread)" : "All Mail"}
            </h1>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full font-medium">
              {filteredEmails.length} messages
            </span>
          </div>

          {/* Messages Alert Banner inside layout */}
          <div className="flex-1 max-w-md mx-4">
            {successMsg && (
              <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold flex items-center space-x-1.5 animate-slide-down">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="truncate">{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold flex items-center space-x-1.5 animate-slide-down">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="truncate">{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-3.5 shrink-0">
            {/* Sync Mock Toggle */}
            <div className="flex items-center bg-[#131d31] border border-slate-800 rounded-lg p-1 space-x-1 text-xs">
              <button
                onClick={() => setUseMock(true)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center space-x-1 ${
                  useMock ? "bg-blue-600 text-white font-bold" : "text-slate-500 hover:text-slate-300"
                }`}
                title="Use offline mock email set for testing"
              >
                <WifiOff className="h-3 w-3" />
                <span>Mock Mode</span>
              </button>
              <button
                onClick={() => {
                  setUseMock(false);
                  if (!user?.hasGoogleConnected) {
                    if (confirm("Your account is not connected to Gmail yet. Link your Google Account now?")) {
                      connectGoogle();
                    }
                  }
                }}
                className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center space-x-1 ${
                  !useMock ? "bg-blue-600 text-white font-bold" : "text-slate-500 hover:text-slate-300"
                }`}
                title="Connect real Gmail Account via OAuth2"
              >
                <Wifi className="h-3 w-3" />
                <span>Live Gmail</span>
              </button>
            </div>

            {/* Sync Button */}
            <button
              onClick={handleSyncEmails}
              disabled={loading}
              className="bg-[#1e293b] hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer border border-slate-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Syncing..." : "Sync Mail"}</span>
            </button>

            {/* Retrain AI Model Button */}
            <button
              onClick={handleTrainModel}
              disabled={trainingLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 cursor-pointer"
            >
              <BrainCircuit className={`h-3.5 w-3.5 ${trainingLoading ? "animate-spin" : ""}`} />
              <span>{trainingLoading ? "Training AI..." : "Train AI Model"}</span>
            </button>
          </div>
        </header>

        {/* Content Body Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Email List Subpane */}
          <div className="w-80 border-r border-slate-800/80 flex flex-col bg-[#0b0f19]/80 shrink-0">
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-800/80 bg-[#0b0f19]">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search subject, sender..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141f32]/50 border border-slate-800/80 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Card stack container */}
            <div className="flex-1 overflow-y-auto">
              {filteredEmails.map((email) => (
                <EmailCard
                  key={email._id}
                  email={email}
                  categories={categories}
                  isSelected={selectedEmail?._id === email._id}
                  onClick={() => setSelectedEmail(email)}
                  onUpdateLabel={handleUpdateLabel}
                />
              ))}

              {filteredEmails.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-600 mt-12">
                  <Mail className="h-10 w-10 text-slate-700 mb-2" />
                  <p className="text-xs font-medium">No emails found</p>
                  <p className="text-[10px] text-slate-500 mt-1">Try hitting Sync Mail to download latest.</p>
                </div>
              )}
            </div>
          </div>

          {/* Workspace Detail Subpane: Stats or Email Body */}
          <div className="flex-1 bg-[#070a13] overflow-y-auto p-6">
            {selectedEmail ? (
              /* Email Reader Detail View */
              <div className="bg-[#0f172a]/60 border border-slate-800 rounded-xl p-6 space-y-6 max-w-4xl mx-auto shadow-xl relative animate-slide-down">
                {/* Header controls */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Back to stats"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <div>
                      <h2 className="text-base font-bold text-white leading-snug">
                        {selectedEmail.subject}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">Classification:</span>
                    {/* Popover category dropdown inside email body */}
                    <div className="relative">
                      <button
                        onClick={() => setShowDetailPicker(!showDetailPicker)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 border cursor-pointer ${
                          selectedEmail.userAssignedLabel
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : selectedEmail.predictedLabel
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            : "bg-slate-800 border-slate-700 text-slate-400"
                        }`}
                      >
                        <Tag className="h-3 w-3" />
                        <span className="capitalize">
                          {selectedEmail.userAssignedLabel?.name ||
                            selectedEmail.predictedLabel?.name ||
                            "Uncategorized"}
                        </span>
                      </button>
                      
                      {showDetailPicker && (
                        <CategoryPicker
                          categories={categories}
                          currentCategoryId={selectedEmail.userAssignedLabel?._id || selectedEmail.predictedLabel?._id}
                          onSelectCategory={(catId) => handleUpdateLabel(selectedEmail._id, catId)}
                          closePicker={() => setShowDetailPicker(false)}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Email Metadata */}
                <div className="flex flex-col md:flex-row md:items-center justify-between text-xs text-slate-400 bg-[#131d31]/30 p-3 rounded-lg border border-slate-800/40">
                  <div className="space-y-1">
                    <p className="flex items-center space-x-1.5 text-slate-300">
                      <span className="font-semibold text-slate-500">From:</span>
                      <span>{selectedEmail.sender}</span>
                    </p>
                    <p className="flex items-center space-x-1.5">
                      <span className="font-semibold text-slate-500">Date:</span>
                      <span>{new Date(selectedEmail.receivedAt).toLocaleString()}</span>
                    </p>
                  </div>
                  {selectedEmail.predictedLabel && (
                    <div className="mt-2.5 md:mt-0 flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400">
                      <BrainCircuit className="h-4 w-4 text-blue-400" />
                      <span>
                        Predicted accuracy:{" "}
                        <strong className="text-white font-bold">
                          {Math.round(selectedEmail.confidenceScore * 100)}%
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Email Content Body */}
                <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed min-h-60 border-t border-slate-800/40 pt-4 font-sans">
                  {selectedEmail.content}
                </div>
              </div>
            ) : (
              /* Dashboard Stats & Analytics View (Rendered by default) */
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Dashboard Stats Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
                      <span>SmartMail AI Analytics</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Visualizing your inbox classification metrics and AI learning performance.
                    </p>
                  </div>

                  {user && !user.hasGoogleConnected && (
                    <button
                      onClick={connectGoogle}
                      className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-all shadow cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 0, 0)">
                          <path d="M21.35,11.1H12v2.7h5.38C16.88,15.22,14.73,16.5,12,16.5c-3.03,0-5.61-2.05-6.53-4.82C5.17,10.79,5,9.91,5,9c0-0.91,0.17-1.79,0.47-2.68c0.92-2.77,3.5-4.82,6.53-4.82c1.64,0,3.13,0.6,4.29,1.59L18.42,1.2C16.69,0.45,14.47,0,12,0C7.35,0,3.37,2.83,1.6,6.93C1.07,8.18,0.78,9.55,0.78,11c0,1.45,0.29,2.82,0.82,4.07c1.77,4.1,5.75,6.93,10.4,6.93c3.12,0,5.73-1.04,7.64-2.83c2.09-1.95,3.35-4.83,3.35-8.23C23,12.1,22.84,11.59,21.35,11.1z" fill="#4285F4" />
                        </g>
                      </svg>
                      <span>Connect Gmail Account</span>
                    </button>
                  )}
                </div>

                <DashboardStats stats={stats} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
