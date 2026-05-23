import React from "react";
import { Mail, CheckCircle, Percent, Shield, Activity } from "lucide-react";

const DashboardStats = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      title: "Total Emails",
      value: stats.totalEmails || 0,
      icon: <Mail className="h-5 w-5 text-blue-400" />,
      bg: "bg-blue-500/5 border-blue-500/10",
      desc: "All inbox messages"
    },
    {
      title: "AI Classified",
      value: stats.autoClassified || 0,
      icon: <Activity className="h-5 w-5 text-indigo-400" />,
      bg: "bg-indigo-500/5 border-indigo-500/10",
      desc: "Automatically classified"
    },
    {
      title: "Manually Corrected",
      value: stats.manuallyLabeled || 0,
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
      bg: "bg-emerald-500/5 border-emerald-500/10",
      desc: "User overrides / ground truth"
    },
    {
      title: "Model Accuracy",
      value: `${stats.accuracy || 100}%`,
      icon: <Percent className="h-5 w-5 text-purple-400" />,
      bg: "bg-purple-500/5 border-purple-500/10",
      desc: "Prediction vs User assignment"
    }
  ];

  const categories = Object.entries(stats.categoryBreakdown || {});

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`p-4 border rounded-xl flex items-start space-x-3.5 shadow-sm ${card.bg}`}
          >
            <div className="p-2 bg-[#0f172a] border border-slate-800 rounded-lg shrink-0">
              {card.icon}
            </div>
            <div>
              <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{card.title}</h4>
              <p className="text-xl font-bold text-white mt-1 leading-none">{card.value}</p>
              <p className="text-[10px] text-slate-500 mt-1.5">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories Proportion breakdown */}
      <div className="bg-[#0f172a]/40 border border-slate-800/80 p-5 rounded-xl">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
          <Shield className="h-4.5 w-4.5 text-blue-500" />
          <span>Category Distribution</span>
        </h3>
        
        <div className="space-y-3.5">
          {categories.map(([name, data]) => {
            const percentage = stats.totalEmails > 0 ? (data.count / stats.totalEmails) * 100 : 0;
            return (
              <div key={name} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: data.color }}
                    />
                    <span className="capitalize font-medium text-slate-300 truncate">{name}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-bold text-white">{data.count}</span>
                    <span className="text-slate-500">({Math.round(percentage)}%)</span>
                  </div>
                </div>
                {/* Custom Progress Bar */}
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/30">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: data.color
                    }}
                  />
                </div>
              </div>
            );
          })}

          {categories.length === 0 && (
            <div className="text-center py-4 text-xs text-slate-500 italic">
              No categories found. Sync emails or create custom labels to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
