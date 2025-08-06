export default function Error404() {
  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-100 mb-4">404</h1>
        <p className="text-xl text-gray-300 mb-8">Page not found</p>
        <a 
          href="/" 
          className="text-blue-400 hover:text-blue-300 underline"
        >
          Go back home
        </a>
      </div>
    </div>
  );
}
