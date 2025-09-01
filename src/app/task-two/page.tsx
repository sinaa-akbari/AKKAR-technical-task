"use client";
import React, { useState } from "react";

const page = () => {
  // I know the "any" type is discouraged. You won't find it in my code, trust me :)
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<{
    successful: number;
    failed: number;
    duration: number;
  } | null>(null);

  async function handleFetchWithConcurrency(
    urls: string[],
    maxConcurrency: number
  ) {
    // create a queue of urls with their original indexes
    const queue = urls.map((url, index) => ({ url, index }));

    // an array to store the final results in order
    const results = new Array(urls.length);

    // an array to store the promises for each worker
    const workers = [];

    // the `handleCallApis` function plays the role of a worker.
    // it will run until the queue is empty
    const handleCallApis = async () => {
      while (queue.length > 0) {
        // we remove the first task from the queue
        const task = queue.shift();
        if (!task) continue; // if the queue is empty, dont panic, we continue the loop

        const { url, index } = task;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          results[index] = { status: "fulfilled", value: data };
        } catch (error: any) {
          results[index] = { status: "rejected", reason: error.message };
        }
      }
    };

    // This loop is for creating the workers
    for (let i = 0; i < maxConcurrency; i++) {
      workers.push(handleCallApis());
    }

    //wait for all the workers to finish their work
    await Promise.all(workers);

    return results;
  }

  // Test function for handleFetchWithConcurrency using The Movie Database API
  async function testMovieFetching() {
    // Create an array of 100 random 6-digit numbers
    const randomMovieIds = Array.from(
      { length: 100 },
      () => Math.floor(Math.random() * 900000) + 100000
    );

    // Create URLs for The Movie Database API
    // Note: You'll need to replace 'YOUR_API_KEY' with an actual API key
    const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY; // Replace with your actual API key
    const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
    const language = "en-US";
    const movieUrls = randomMovieIds.map(
      (id) => `${baseUrl}/movie/${id}?api_key=${API_KEY}&language=${language}`
    );

    console.log("Starting movie fetch with concurrency...");
    console.log(
      `Fetching ${movieUrls.length} movies with max concurrency of 5`
    );

    try {
      const startTime = Date.now();
      const results = await handleFetchWithConcurrency(movieUrls, 5);
      const endTime = Date.now();

      console.log(`Fetch completed in ${endTime - startTime}ms`);

      // Count successful and failed requests
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      console.log(`Successful requests: ${successful}`);
      console.log(`Failed requests: ${failed}`);

      return {
        results,
        stats: { successful, failed, duration: endTime - startTime },
      };
    } catch (error) {
      console.error("Error during testing:", error);
      throw error;
    }
  }

  // Function to handle the test button click
  const handleTestClick = async () => {
    setIsLoading(true);
    try {
      const { results: fetchedResults, stats: fetchedStats } =
        await testMovieFetching();
      setResults(fetchedResults);
      setStats(fetchedStats);
    } catch (error) {
      console.error("Test failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Task Two: Concurrency Testing</h1>
      {/* Fetch Button */}
      <button
        onClick={() => handleTestClick()}
        disabled={isLoading}
        className={`font-semibold py-3 px-6 rounded-lg transition-all duration-200 ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 hover:shadow-lg"
        } text-white`}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Fetching Movies...
          </div>
        ) : (
          "Test Movie Fetching (100 movies, max 5 concurrent)"
        )}
      </button>

      {/* Statistics Section */}
      {stats && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Successful</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.successful}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-600">Failed</p>
                <p className="text-2xl font-bold text-red-900">
                  {stats.failed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Duration</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.duration}ms
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="mt-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Results</h3>
              <span className="text-sm text-gray-500">
                {results.length} total results
              </span>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default page;
