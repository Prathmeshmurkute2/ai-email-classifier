import React, { useState } from "react";
import CategoryPicker from "./CategoryPicker";
import { Tag, User, Calendar, Brain, Sparkles, CheckSquare } from "lucide-react";

const EmailCard = ({ email, categories, isSelected, onClick, onUpdateLabel }) => {
  const [showPicker, setShowPicker] = useState(false);

  const formattedDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const finalLabel = email.userAssignedLabel || email.predictedLabel;
  const isOverridden = !!email.userAssignedLabel;

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-slate-800/80 cursor-pointer flex flex-col space-y-2.5 transition-all relative ${
        isSelected
          ? "bg-slate-800/30 border-l-4 border-l-blue-500 pl-3"
          : "hover:bg-slate-800/10 bg-[#0f172a]/20"
      }`}
    >
      {/* Top row: Sender & Date */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-1.5 font-medium text-slate-300 max-w-[70%] truncate">
          <User className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{email.sender}</span>
        </div>
        <div className="flex items-center space-x-1 shrink-0 text-slate-500">
          <Calendar className="h-3 w-3" />
          <span>{formattedDate(email.receivedAt)}</span>
        </div>
      </div>

      {/* Title / Subject */}
      <h3 className={`text-sm ${email.status === "unread" ? "font-bold text-white" : "font-medium text-slate-300"} truncate`}>
        {email.subject}
      </h3>

      {/* Snippet / Content Preview */}
      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
        {email.content}
      </p>

      {/* Classification Badges and Reclassify Controls */}
      <div className="flex items-center justify-between pt-1.5 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center space-x-2 flex-wrap">
          {finalLabel ? (
            <div
              className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                isOverridden
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: finalLabel.color || "#3b82f6" }}
              />
              <span className="truncate">{finalLabel.name}</span>
              {isOverridden ? (
                <CheckSquare className="h-3 w-3 text-emerald-400" title="User assigned" />
              ) : (
                <Brain className="h-3 w-3 text-blue-400" title="AI predicted" />
              )}
            </div>
          ) : (
            <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700/50">
              Uncategorized
            </div>
          )}

          {/* AI Confidence Badge */}
          {!isOverridden && email.predictedLabel && email.confidenceScore > 0 && (
            <span className="text-[10px] text-slate-500 font-semibold bg-slate-800/40 px-1.5 py-0.5 rounded border border-slate-800/80">
              Confidence: {Math.round(email.confidenceScore * 100)}%
            </span>
          )}
        </div>

        {/* Category Picker Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="p-1 hover:bg-slate-800 rounded-md text-slate-500 hover:text-white transition-colors cursor-pointer"
            title="Classify email"
          >
            <Tag className="h-4 w-4" />
          </button>
          
          {showPicker && (
            <CategoryPicker
              categories={categories}
              currentCategoryId={email.userAssignedLabel?._id || email.predictedLabel?._id}
              onSelectCategory={(catId) => onUpdateLabel(email._id, catId)}
              closePicker={() => setShowPicker(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailCard;
