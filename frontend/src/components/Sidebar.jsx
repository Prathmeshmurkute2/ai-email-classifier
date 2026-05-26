import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Inbox, Mail, FolderHeart, Plus, LogOut, ChevronRight, Sparkles, Folder, Trash2 } from "lucide-react";

const AESTHETIC_COLORS = [
  "#ef4444", // Red
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
];

const Sidebar = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  onCreateCategory,
  onDeleteCategory,
  activeMailbox,
  setActiveMailbox,
}) => {
  const { logout, user } = useAuth();
  const [newCatName, setNewCatName] = useState("");
  const [selectedColor, setSelectedColor] = useState(AESTHETIC_COLORS[3]); // Default to blue
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onCreateCategory(newCatName.trim(), selectedColor);
    setNewCatName("");
    setShowAddForm(false);
  };

  return (
    <aside className="w-64 bg-[#0d1527] border-r border-slate-800 flex flex-col justify-between shrink-0 h-full text-slate-300">
      {/* Upper Section */}
      <div className="p-5 flex flex-col space-y-6 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center space-x-2.5 px-1.5">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-white tracking-wide text-base leading-none">SmartMail AI</h2>
            <span className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase">Assistant</span>
          </div>
        </div>

        {/* Mailboxes Navigation */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Mailboxes</span>
          
          <button
            onClick={() => {
              setActiveMailbox("inbox");
              setSelectedCategory(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeMailbox === "inbox" && !selectedCategory
                ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500 pl-2.5"
                : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Inbox className="h-4 w-4" />
              <span>Inbox</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveMailbox("all");
              setSelectedCategory(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeMailbox === "all" && !selectedCategory
                ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500 pl-2.5"
                : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Mail className="h-4 w-4" />
              <span>All Mail</span>
            </div>
          </button>
        </div>

        {/* Custom Labels Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Custom Labels</span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Add Category"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="p-2.5 bg-[#142038] border border-slate-800 rounded-lg space-y-3 animate-slide-down">
              <div>
                <input
                  type="text"
                  placeholder="Category Name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Select Color</span>
                <div className="flex space-x-1.5 justify-between">
                  {AESTHETIC_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`h-5 w-5 rounded-full border-2 transition-all cursor-pointer ${
                        selectedColor === c ? "border-white scale-110 shadow-md" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium py-1.5 transition-colors cursor-pointer"
              >
                Create Label
              </button>
            </form>
          )}

          <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="group relative flex items-center w-full"
              >
                <button
                  onClick={() => {
                    setSelectedCategory(cat);
                    setActiveMailbox(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all cursor-pointer pr-8 ${
                    selectedCategory?._id === cat._id
                      ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500 pl-2.5"
                      : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color || "#3b82f6" }}
                    />
                    <span className="truncate capitalize">{cat.name}</span>
                  </div>
                  {cat.isSystem && (
                    <ChevronRight className="h-3 w-3 opacity-30 group-hover:opacity-100" />
                  )}
                </button>

                {!cat.isSystem && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `Are you sure you want to delete the label "${cat.name.toUpperCase()}"? Any emails classified under this category will return to Uncategorized.`
                        )
                      ) {
                        onDeleteCategory(cat._id);
                      }
                    }}
                    className="absolute right-2 p-1.5 rounded hover:bg-red-500/15 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Delete Label"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-4 text-xs text-slate-600 italic">
                No custom labels created.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-slate-800/60 bg-[#0a0f1d] flex flex-col space-y-3">
        <div className="flex items-center space-x-3 px-1.5 py-1">
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400 uppercase text-xs">
            {user?.name ? user.name[0] : "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
              {user?.name || "Loading..."}
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {user?.email || "No email"}
            </p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 text-xs font-semibold hover:bg-red-500/10 hover:text-red-400 text-slate-500 border border-transparent hover:border-red-500/20 py-2 rounded-lg transition-all cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
