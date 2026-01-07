'use client';

import { useEffect, useState } from "react";

type Summary = {
  daily_consumption: { date: string; total_energy: number }[];
  peak_power: number;
  average_voltage: number;
  average_current: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<Summary | null>(null);

useEffect(() => {
  fetch("http://127.0.0.1:8000/api/energy/summary")
    .then(async (res) => {
      console.log("Response status:", res.status); // <-- check this
      const text = await res.text();               // <-- get raw response
      console.log("Response text:", text);         // <-- see if it's HTML 404
      try {
        const json = JSON.parse(text);
        setData(json);
      } catch (err) {
        console.error("JSON parse error:", err);
      }
    })
    .catch(err => console.error("Fetch error:", err));
}, []);



  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Energy Dashboard</h1>
      <div className="mb-4">
        <p>Peak Power: {data.peak_power} W</p>
        <p>Average Voltage: {data.average_voltage?.toFixed(2)} V</p>
        <p>Average Current: {data.average_current?.toFixed(2)} A</p>
      </div>

      <h2 className="text-xl font-semibold mb-2">Daily Energy Consumption</h2>
      <ul>
        {data.daily_consumption.length ? (
          data.daily_consumption.map((d) => (
            <li key={d.date}>
              {d.date}: {d.total_energy} Wh
            </li>
          ))
        ) : (
          <li>No data available</li>
        )}
      </ul>
    </div>
  );
}
