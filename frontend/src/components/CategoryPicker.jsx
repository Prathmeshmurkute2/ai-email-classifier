import React from "react";
import { Check, X, RefreshCw } from "lucide-react";

const CategoryPicker = ({ categories, currentCategoryId, onSelectCategory, closePicker }) => {
  return (
    <div className="absolute right-0 mt-1 w-48 bg-[#0f172a] border border-slate-800 rounded-lg shadow-xl z-30 py-1.5 text-xs text-slate-300 animate-slide-down">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800/60 mb-1">
        <span className="font-semibold text-slate-400">Reclassify Email</span>
        <button onClick={closePicker} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="max-h-48 overflow-y-auto">
        {categories.map((cat) => {
          const isSelected = currentCategoryId === cat._id;
          return (
            <button
              key={cat._id}
              onClick={() => {
                onSelectCategory(cat._id);
                closePicker();
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between group cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || "#3b82f6" }}
                />
                <span className="truncate capitalize">{cat.name}</span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-blue-500" />}
            </button>
          );
        })}

        {categories.length === 0 && (
          <div className="text-center py-3 text-slate-600 italic">
            No custom labels.
          </div>
        )}
      </div>

      {currentCategoryId && (
        <div className="border-t border-slate-800/60 mt-1 pt-1">
          <button
            onClick={() => {
              onSelectCategory(null); // Clear label override
              closePicker();
            }}
            className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 flex items-center space-x-2 cursor-pointer transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Classification</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryPicker;
