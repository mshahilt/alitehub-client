const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-8 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-t-transparent border-r-cyan-500 border-b-transparent border-l-cyan-500 rounded-full animate-spin-slow" />
        </div>
        <p className="text-white font-medium">Please wait...</p>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;