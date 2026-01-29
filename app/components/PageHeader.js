"use client";

export default function PageHeader({ 
  title, 
  description, 
  icon: Icon,
  actions 
}) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {Icon && (
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Icon className="text-3xl text-white" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
            {description && (
              <p className="text-blue-100 text-sm">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
