"use client";

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color = "blue",
  trend,
  trendUp = true 
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className={`bg-gradient-to-r ${colorClasses[color]} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
            <p className="text-white text-3xl font-bold">{value}</p>
          </div>
          {Icon && (
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon className="text-2xl text-white" />
            </div>
          )}
        </div>
      </div>
      
      {trend && (
        <div className="px-4 py-3 bg-gray-50">
          <div className="flex items-center text-sm">
            <span className={`font-semibold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
      )}
    </div>
  );
}
