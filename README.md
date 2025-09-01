# AKKAR Technical Task

This is a technical assessment for [Stark Future Company](https://starkfuture.com/).

## Project Overview

This project contains two technical tasks implemented using Next.js with TypeScript and Tailwind CSS:

- **Task One**: License Plate Generator with mathematical algorithm
- **Task Two**: Concurrent API Fetching with Rate Limiting

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. **Environment Setup**: Rename the `.env.example` file to `.env` for the second task to work properly

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── task-one/          # License Plate Generator
│   │   └── page.tsx       # Main implementation
│   ├── task-two/          # Second task
│   │   └── page.tsx       # Implementation
```

## Task One: License Plate Generator

### Overview

The license plate generator creates 6-character license plates using a mathematical algorithm that generates plates in a specific sequence:

1. **All Numeric Plates** (000000-999999): First 1,000,000 plates
2. **Mixed Plates**: Combinations of numbers and letters in ascending order

### Core Algorithm: `getLicensePlate(n: number)`

The `getLicensePlate` function is the heart of the license plate generation system. It takes a number `n` and returns the corresponding license plate.

#### Function Signature
```typescript
const getLicensePlate = (n: number): string
```

#### Parameters
- `n`: A non-negative integer representing the position in the license plate sequence

#### Returns
- A 6-character string representing the license plate

#### Algorithm Breakdown

##### 1. Input Validation
```typescript
if (typeof n !== "number" || n < 0) {
  setError("Input must be a non-negative integer.");
  return "000000";
}
```

##### 2. All Numeric Block (0-999,999)
For numbers less than 1,000,000, the function generates purely numeric plates:
```typescript
const allNumbersBlockSize = Math.pow(WHOLE_NUMBERS_LENGTH, License_LENGTH);
if (n < allNumbersBlockSize) {
  return n.toString().padStart(License_LENGTH, "0");
}
```

##### 3. Mixed Plates Algorithm
For numbers ≥ 1,000,000, the algorithm generates mixed plates with letters and numbers:

**Step 1**: Calculate remaining value after numeric block
```typescript
let remainingN = n - allNumbersBlockSize;
```

**Step 2**: Iterate through different letter counts (1 to 6 letters)
```typescript
for (let lettersCount = 1; lettersCount <= License_LENGTH; lettersCount++) {
  const digitsCount = License_LENGTH - lettersCount;
```

**Step 3**: Calculate block sizes for each combination
```typescript
const numberCombinations = Math.pow(WHOLE_NUMBERS_LENGTH, digitsCount);
const currentBlockSize = numberCombinations * Math.pow(ALPHABET_SIZE, lettersCount);
```

**Step 4**: Generate the plate when the correct block is found
```typescript
if (remainingN < currentBlockSize) {
  const numberPartValue = remainingN % numberCombinations;
  const letterPartValue = Math.floor(remainingN / numberCombinations);
  
  // Generate letter part
  let tempLetterValue = letterPartValue;
  let letterPart = "";
  for (let i = 0; i < lettersCount; i++) {
    const remainder = tempLetterValue % ALPHABET_SIZE;
    letterPart = String.fromCharCode(CHAR_CODE_A + remainder) + letterPart;
    tempLetterValue = Math.floor(tempLetterValue / ALPHABET_SIZE);
  }
  
  // Generate number part
  const numberPart = digitsCount > 0 
    ? numberPartValue.toString().padStart(digitsCount, "0") 
    : "";
    
  return numberPart + letterPart;
}
```

#### Constants Used
```typescript
const ALPHABET_SIZE = 26;           // A-Z letters
const License_LENGTH = 6;           // 6-character plates
const WHOLE_NUMBERS_LENGTH = 10;    // 0-9 digits
const CHAR_CODE_A = "A".charCodeAt(0); // ASCII code for 'A'
```

#### Example Usage

```typescript
getLicensePlate(0)      // "000000"
getLicensePlate(999999) // "999999"
getLicensePlate(1000000) // "00000A"
getLicensePlate(1000001) // "00000B"
getLicensePlate(1000025) // "00000Z"
getLicensePlate(1000026) // "00001A"
```




## Task Two: Concurrent API Fetching with Rate Limiting

### Overview

Task Two implements a concurrent API fetching system that demonstrates efficient handling of multiple HTTP requests with controlled concurrency. The system uses a worker-based approach to manage API calls while respecting rate limits and providing comprehensive error handling.

### Core Algorithm: `handleFetchWithConcurrency(urls: string[], maxConcurrency: number)`

The `handleFetchWithConcurrency` function is the core of the concurrent fetching system. It implements a queue-based worker pattern to efficiently handle multiple API requests with controlled concurrency.

#### Function Signature
```typescript
async function handleFetchWithConcurrency(
  urls: string[],
  maxConcurrency: number
): Promise<Array<{ status: "fulfilled" | "rejected", value?: any, reason?: string }>>
```

#### Parameters
- `urls`: Array of URLs to fetch
- `maxConcurrency`: Maximum number of concurrent requests allowed

#### Returns
- Promise that resolves to an array of results with status and data/error information

#### Algorithm Breakdown

##### 1. Queue Initialization
```typescript
const queue = urls.map((url, index) => ({ url, index }));
const results = new Array(urls.length);
const workers = [];
```
Creates a queue of tasks with their original indices to maintain order in results.

##### 2. Worker Function Definition
```typescript
const handleCallApis = async () => {
  while (queue.length > 0) {
    const task = queue.shift();
    if (!task) continue;

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
```

**Key Features:**
- **Queue Processing**: Each worker continuously processes tasks from the queue
- **Order Preservation**: Results are stored at their original indices
- **Error Handling**: Graceful handling of network errors and HTTP failures
- **Non-blocking**: Workers continue even if individual requests fail

##### 3. Worker Pool Creation
```typescript
for (let i = 0; i < maxConcurrency; i++) {
  workers.push(handleCallApis());
}
await Promise.all(workers);
```

Creates a pool of workers and waits for all to complete.

#### Implementation Details

##### Concurrency Control
- **Worker Pool**: Fixed number of workers based on `maxConcurrency`
- **Queue Management**: FIFO (First In, First Out) task processing
- **Resource Efficiency**: Prevents overwhelming the target API

##### Error Handling Strategy
```typescript
// Successful requests
results[index] = { status: "fulfilled", value: data };

// Failed requests
results[index] = { status: "rejected", reason: error.message };
```

##### Performance Monitoring
```typescript
const startTime = Date.now();
const results = await handleFetchWithConcurrency(movieUrls, 5);
const endTime = Date.now();
const duration = endTime - startTime;
```

#### Example Usage

```typescript
const urls = [
  'https://api.example.com/data1',
  'https://api.example.com/data2',
  'https://api.example.com/data3'
];

const results = await handleFetchWithConcurrency(urls, 2);
// Returns: [
//   { status: "fulfilled", value: {...} },
//   { status: "rejected", reason: "HTTP error! status: 404" },
//   { status: "fulfilled", value: {...} }
// ]
```

### Test Implementation: Movie Database API

The task includes a practical implementation using The Movie Database (TMDB) API:

#### Test Function: `testMovieFetching()`
```typescript
async function testMovieFetching() {
  // Generate 100 random movie IDs
  const randomMovieIds = Array.from(
    { length: 100 },
    () => Math.floor(Math.random() * 900000) + 100000
  );

  // Create API URLs
  const movieUrls = randomMovieIds.map(
    (id) => `${baseUrl}/movie/${id}?api_key=${API_KEY}&language=${language}`
  );

  // Execute with concurrency control
  const results = await handleFetchWithConcurrency(movieUrls, 5);
  
  return { results, stats: { successful, failed, duration } };
}
```

#### Features
- **Random Data**: Generates 100 random movie IDs for testing
- **API Integration**: Uses TMDB API with proper authentication
- **Statistics**: Tracks successful/failed requests and execution time
- **Real-world Testing**: Demonstrates the system with actual API calls

### Configuration

The system uses environment variables for API configuration:
```typescript
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
```

## Technical Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS