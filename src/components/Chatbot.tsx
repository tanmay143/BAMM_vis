"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import axios from 'axios';

interface ChatbotProps {
  onFileReceived: (filename: string) => void;  // Callback function to send filename to parent
  onSend: () => void; // Callback function to trigger loading state
}

export default function Chatbot({ onFileReceived, onSend }: ChatbotProps) {
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (input.trim()) {
      onSend(); // Trigger loading screen before making request
      setInput(""); // Clear input field immediately after clicking send

      try {
        const formData = { "text_prompt": input };

        const response = await axios.post('http://localhost:8000/generate-motion', formData);

        if (response.status !== 200) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.data;
        onFileReceived(data.filename); // Send filename to parent component

      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex items-center px-4 space-x-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="flex-grow"
      />
      <Button type="submit" size="icon">
        <Send className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
