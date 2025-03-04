"use client"

import { useState } from "react"
import Canvas from "@/components/Canvas"
import Chatbot from "@/components/Chatbot"
import MeasurementControls, { type Measurements } from "@/components/MeasurementControls"
import axios from "axios";
import createAndSaveGLB from "@/lib/createMesh";

export default function Home() {
  const [bvhFile, setBvhFile] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [trigger, setTrigger] = useState(false);  // Dummy state for re-triggering
  const [measurements, setMeasurements] = useState<Measurements>({
    height: 175,
    inseam: 80,
    chest: 100,
    waist: 85,
    hips: 95,
  })

  const handleFileReceived = (filename: string) => {
    setBvhFile(filename)
    setLoading(false)
  }

  const handleSend = () => {
    setBvhFile(null)
    setLoading(true)
  }

  const handleMeasurementsChange = async (newMeasurements: Measurements) => {
    await setMeasurements(newMeasurements);
    const response = await axios.post('http://localhost:8080/calculate-anthrobetas/', newMeasurements);
    const glbResult = await createAndSaveGLB(response.data);

    if (glbResult === true) {
        setTrigger((prev) => !prev);  // Toggle trigger to force update
        console.log("GLB file created successfully, BVH file updated.");
    } else {
        console.error("GLB file creation failed, skipping BVH file update.");
    }
};

  return (
    <div className="flex flex-col h-screen">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-xl font-semibold">Loading...</p>
        </div>
      ) : (
        <div className="flex-grow flex overflow-hidden">
          <div className="min-w-[200px] border-r"> {/* Adjust the width here */}
            <MeasurementControls initialMeasurements={measurements} onChange={handleMeasurementsChange} />
          </div>
          <div className="flex-grow overflow-hidden">
            <Canvas bvhFile={bvhFile} trigger={trigger} />
          </div>
        </div>
      )}
      <div className="h-10 border-t">
        <Chatbot onFileReceived={handleFileReceived} onSend={handleSend} />
      </div>
    </div>
  )
}