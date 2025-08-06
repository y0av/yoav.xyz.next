'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-100 mb-4">Error</h1>
        <p className="text-xl text-gray-300 mb-8">Something went wrong!</p>
        <button
          onClick={reset}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg mr-4"
        >
          Try again
        </button>
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
