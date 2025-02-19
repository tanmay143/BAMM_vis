"use client"

import { useState } from "react";
import Canvas from "@/components/Canvas";
import Chatbot from "@/components/Chatbot";

export default function Home() {
  const [bvhFile, setBvhFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Initially not loading

  const handleFileReceived = (filename: string) => {
    setBvhFile(filename);
    setLoading(false); // Hide loading screen once file is received
  };

  const handleSend = () => {
    setBvhFile(null); // Clear previous file reference
    setLoading(true); // Show loading screen when send is clicked
  };

  return (
    <div className="flex flex-col h-screen">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-xl font-semibold">Loading...</p>
        </div>
      ) : (
        <div className="flex-grow">
          <Canvas bvhFile={bvhFile} />
        </div>
      )}
      
      <div className="h-20 border-t">
        <Chatbot onFileReceived={handleFileReceived} onSend={handleSend} />
      </div>
    </div>
  );
}
