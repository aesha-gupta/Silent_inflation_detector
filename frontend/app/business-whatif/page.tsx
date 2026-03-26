"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BusinessWhatIfSimulator from "@/components/BusinessWhatIfSimulator";

export default function BusinessWhatIfPage() {
  const [baseParams, setBaseParams] = useState<any>(null);
  const [baseResult, setBaseResult] = useState<any>(null);

  useEffect(() => {
    try {
      const storedResult = sessionStorage.getItem("businessResult");
      const storedParams = sessionStorage.getItem("businessParams"); // wait, did I save params previously? 
      
      if (storedResult) {
        setBaseResult(JSON.parse(storedResult));
      }
      
      // I need to retrieve the costs and sector from somewhere. 
      // If I didn't save them, this page might not be fully functional.
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="flex flex-col lg:flex-row w-full h-full min-h-screen">
      <div className="flex-1 flex flex-col border-r border-[var(--frame-color)]">
        <BusinessWhatIfSimulator />
      </div>
    </div>
  );
}