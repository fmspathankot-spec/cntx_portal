export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* Animated Spinner */}
        <div className="relative inline-block mb-6">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-14 w-14 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Loading Text */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading OTN Routes</h1>
        <p className="text-gray-600 mb-6">Fetching the latest route information...</p>

        {/* Loading Dots Animation */}
        <div className="flex justify-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s',
                animationIterationCount: 'infinite'
              }}
            />
          ))}
        </div>

        {/* Subtle Progress Bar */}
        <div className="mt-8 w-full bg-gray-200 rounded-full h-1.5 max-w-xs mx-auto overflow-hidden">
          <div className="bg-blue-500 h-1.5 rounded-full w-1/3 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
