"use client";
import React, { useEffect, useState } from "react";

// Constants
const ALPHABET_SIZE = 26;
const License_LENGTH = 6;
const WHOLE_NUMBERS_LENGTH = 10;
const CHAR_CODE_A = "A".charCodeAt(0);

const page = () => {
  const [license, setLicense] = useState<string>("000000");
  const [plateCounter, setPlateCounter] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const getLicensePlate = (n: number) => {
    // Validation of input
    if (typeof n !== "number" || n < 0) {
      setError("Input must be a non-negative integer.");
      return "000000";
    }

    // First block, all numeric - if the number is lower than 1,000,000
    // 1,000,000 because our license is 6 digits long and we have 10 digits
    const allNumbersBlockSize = Math.pow(WHOLE_NUMBERS_LENGTH, License_LENGTH);
    if (n < allNumbersBlockSize) {
      return n.toString().padStart(License_LENGTH, "0");
    }

    // if its higher than 1 milion, we ignore the 1 milion part and start with the remaining part
    let remainingN = n - allNumbersBlockSize;

    // Next blocks: combination of number and letter
    // this loop will check the number of letters in the license
    for (let lettersCount = 1; lettersCount <= License_LENGTH; lettersCount++) {
      const digitsCount = License_LENGTH - lettersCount;

      // "" numberCombinations "" is point to the length of combinations of numbers in each block
      // and "" currentBlockSize "" is point to the length of combinations of numbers and letters in each block
      const numberCombinations = Math.pow(WHOLE_NUMBERS_LENGTH, digitsCount);
      const currentBlockSize =
        numberCombinations * Math.pow(ALPHABET_SIZE, lettersCount);

      // if the remaining number is less than the current block size, we can generate the license
      if (remainingN < currentBlockSize) {
        // "" numberPartValue "" is for calculating the number part
        // "" letterPartValue "" is for calculting the letter part
        const numberPartValue = remainingN % numberCombinations;
        const letterPartValue = Math.floor(remainingN / numberCombinations);

        // In this loop we will generate the letter part of the license
        let tempLetterValue = letterPartValue;
        let letterPart = "";
        for (let i = 0; i < lettersCount; i++) {
          const remainder = tempLetterValue % ALPHABET_SIZE;
          letterPart =
            String.fromCharCode(CHAR_CODE_A + remainder) + letterPart;
          tempLetterValue = Math.floor(tempLetterValue / ALPHABET_SIZE);
        }

        // We check if there is any empty space, if yes we add 0 to the left side
        const numberPart =
          digitsCount > 0
            ? numberPartValue.toString().padStart(digitsCount, "0")
            : "";

        return numberPart + letterPart;
      }

      remainingN -= currentBlockSize;
    }

    setError("Input is out of range.");
    return "000000";
  };

  const handleGenerate = (inputValue?: number) => {
    setIsGenerating(true);
    setError("");
    if (inputValue) {
      const newPlate = getLicensePlate(inputValue);
      setLicense(newPlate);
    } else {
      setPlateCounter((prevCounter) => {
        const nextCounter = prevCounter + 1;
        const newPlate = getLicensePlate(nextCounter);
        setLicense(newPlate);
        return nextCounter;
      });
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">

        {/* License */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <div className="text-center">
            <h2 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">
              Generated License
            </h2>
            <div className="relative">
              <div
                className={`text-6xl font-mono font-bold text-gray-800 transition-all duration-300 ${
                  isGenerating ? "scale-110 text-blue-600" : "scale-100"
                }`}
              >
                {license}
              </div>
              {isGenerating && (
                <div className="absolute inset-0 bg-blue-100 rounded-lg opacity-50 animate-pulse"></div>
              )}
            </div>
          </div>
        </div>

        {/* Counter */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Plates Generated</p>
            <p className="text-2xl font-bold text-indigo-600">{plateCounter}</p>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={() => {
            handleGenerate();
          }}
          disabled={isGenerating}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
            isGenerating
              ? "bg-gray-400 cursor-not-allowed scale-95"
              : "bg-indigo-600 hover:bg-blue-700 hover:scale-105 active:scale-95 text-white shadow-lg hover:shadow-xl"
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating...
            </div>
          ) : (
            "Generate New Plate"
          )}
        </button>
        <h1 className="text-center text-gray-500 my-4 text-2xl font-bold">
          OR
        </h1>
        {/* Check number input */}
        <div className=" text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Give me a number
            </h3>
            {/* Input */}
            <input
              type="string"
              placeholder="Enter a number"
              value={inputValue}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setInputValue(value);
                }
              }}
              className="text-black w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Button */}
            <button
              onClick={() => {
                handleGenerate(Number(inputValue));
              }}
              disabled={isGenerating}
              className={`w-full mt-4 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                isGenerating
                  ? "bg-gray-400 cursor-not-allowed scale-95"
                  : "bg-indigo-600 hover:bg-blue-700 hover:scale-105 active:scale-95 text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Checking...
                </div>
              ) : (
                "Check the number"
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-500 text-center text-md mt-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
