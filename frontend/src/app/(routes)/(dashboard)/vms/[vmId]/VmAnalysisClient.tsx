// app/vms/[vmId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
    CartesianGrid,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type LogEntry = {
    "@timestamp": string;
    message: string;
    host?: { name?: string };
};

type RawLog = {
    timestamp: string;
    log: { message: string; host?: { name?: string } };
};

type MlResult = {
    timestamp: string;
    score: number;
    prediction: number;
    raw_count: number;
    features: Record<string, number[]>;
};

export default function VmAnalysisClient({
                                             vmId,
                                             customerId,
                                         }: {
    vmId: string;
    customerId: string;
}) {
    const [activeTab, setActiveTab] = useState<"live" | "raw" | "ml">("live");
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [rawLogs, setRawLogs] = useState<RawLog[]>([]);
    const [mlResults, setMlResults] = useState<MlResult[]>([]);
    const [loading, setLoading] = useState(false);

    // 🗓️ Date/time picker state
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [startTime, setStartTime] = useState("00:00");
    const [endTime, setEndTime] = useState("23:59");

    const userId = customerId;
    const API_BASE_URL = "http://localhost:5000";

    // --- Live Logs SSE ---
    useEffect(() => {
        if (activeTab !== "live") return;
        const url = `${API_BASE_URL}/stream?customer_id=${userId}&vm_id=${vmId}`;
        const evtSource = new EventSource(url);

        evtSource.onmessage = (event) => {
            const newLog = JSON.parse(event.data);
            setLogs((prev) => [newLog, ...prev.slice(0, 200)]); // keep last 200
        };

        evtSource.onerror = (err) => {
            console.error("SSE error:", err);
            evtSource.close();
        };

        return () => evtSource.close();
    }, [activeTab, vmId]);

    // --- Fetch Raw Logs + ML Results ---
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const dateStr = selectedDate.toISOString().split("T")[0]; // format YYYY-MM-DD

            const rawRes = await fetch(
                `${API_BASE_URL}/logs/unprocessed?customer_id=${customerId}&vm_id=${vmId}&date=${dateStr}&start_time=${startTime}&end_time=${endTime}`
            );
            const mlRes = await fetch(
                `${API_BASE_URL}/ml/results?customer_id=${customerId}&vm_id=${vmId}&date=${dateStr}&start_time=${startTime}&end_time=${endTime}`
            );

            setRawLogs(await rawRes.json());
            setMlResults(await mlRes.json());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab !== "live") fetchLogs();
    }, [activeTab]);

    // --- Chart Data Transform ---
    const chartData = mlResults.map((r) => ({
        timestamp: new Date(r.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        }),
        score: r.score,
        prediction: r.prediction,
    }));

    // --- UI ---
    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">VM Analysis: {vmId}</h1>

            {/* Tabs */}
            <div className="flex gap-4 border-b pb-2 mb-4">
                {["live", "raw", "ml"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-1 rounded-t-md font-semibold ${
                            activeTab === tab
                                ? "border-b-2 border-blue-600 text-blue-600"
                                : "text-gray-600 hover:text-black"
                        }`}
                    >
                        {tab === "live" ? "Live Logs" : tab === "raw" ? "Raw Logs" : "ML Results"}
                    </button>
                ))}
            </div>

            {/* 🗓️ Date/Time Pickers (only for raw/ml) */}
            {activeTab !== "live" && (
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Date</label>
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={(d) => d && setSelectedDate(d)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Start Time</label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="border rounded px-2 py-1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">End Time</label>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="border rounded px-2 py-1"
                        />
                    </div>

                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className={`mt-2 sm:mt-6 px-4 py-2 rounded text-white ${
                            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {loading ? "Fetching..." : "🔄 Fetch Data"}
                    </button>
                </div>
            )}

            {/* Content */}
            {activeTab === "live" && (
                <ul className="space-y-2 max-h-[70vh] overflow-y-auto border rounded p-2 bg-gray-50">
                    {logs.map((log, i) => (
                        <li key={i} className="p-2 border rounded bg-white text-sm shadow-sm">
                            <p><b>Time:</b> {log["@timestamp"]}</p>
                            <p><b>Host:</b> {log.host?.name}</p>
                            <p><b>Message:</b> {log.message}</p>
                        </li>
                    ))}
                </ul>
            )}

            {activeTab === "raw" && (
                <div>
                    {loading && <p>Loading raw logs...</p>}
                    <ul className="space-y-2">
                        {rawLogs.map((log, i) => (
                            <li key={i} className="p-2 border rounded bg-gray-50 text-sm">
                                <p><b>Time:</b> {log.timestamp}</p>
                                <p><b>Host:</b> {log.log.host?.name}</p>
                                <p><b>Message:</b> {log.log.message}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {activeTab === "ml" && (
                <div>
                    {loading && <p>Loading ML results...</p>}

                    {/* ✅ Summary Stats */}
                    {mlResults.length > 0 && (() => {
                        const totalLogs = mlResults.reduce((acc, r) => acc + r.raw_count, 0);
                        const anomalies = mlResults.filter((r) => r.prediction === -1).length;
                        const anomalyPercent = ((anomalies / mlResults.length) * 100).toFixed(2);

                        // Average feature values across results
                        const avgNumEvents =
                            mlResults.reduce((acc, r) => acc + (r.features.num_events?.[0] ?? 0), 0) /
                            mlResults.length;
                        const avgFailRate =
                            mlResults.reduce((acc, r) => acc + (r.features.fail_rate?.[0] ?? 0), 0) /
                            mlResults.length;

                        const totalSyscalls = Math.round(avgNumEvents * mlResults.length);
                        const totalFailedLogins = Math.round(avgFailRate * totalSyscalls);

                        return (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="p-4 bg-white border rounded shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-600">Anomaly %</h3>
                                    <p className="text-2xl font-bold text-red-600">{anomalyPercent}%</p>
                                </div>
                                <div className="p-4 bg-white border rounded shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-600">Total Logs</h3>
                                    <p className="text-2xl font-bold">{totalLogs}</p>
                                </div>
                                <div className="p-4 bg-white border rounded shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-600">Total Syscalls</h3>
                                    <p className="text-2xl font-bold">{totalSyscalls}</p>
                                </div>
                                <div className="p-4 bg-white border rounded shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-600">Total Failed Events</h3>
                                    <p className="text-2xl font-bold text-orange-500">{totalFailedLogins}</p>
                                </div>
                            </div>
                        );
                    })()}

                    {/* 📈 Recharts Visualization */}
                    {mlResults.length > 0 && (
                        <div className="h-[350px] mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timestamp" name="Time" />
                                    <YAxis dataKey="score" name="Score" />
                                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                                    <Legend />

                                    {/* ✅ Reference Line at y = 0 */}
                                    <ReferenceLine y={0} stroke="gray" strokeDasharray="4 4" label="Threshold" />

                                    {/* Scatter series */}
                                    <Scatter
                                        name="Normal"
                                        data={chartData.filter((d) => d.prediction === 1)}
                                        fill="#3b82f6"
                                    />
                                    <Scatter
                                        name="Anomaly"
                                        data={chartData.filter((d) => d.prediction === -1)}
                                        fill="#ef4444"
                                    />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* 🧾 Detailed ML Results */}
                    <ul className="space-y-4">
                        {mlResults.map((r, i) => (
                            <li key={i} className="p-3 border rounded bg-gray-50 text-sm">
                                <p><b>Time:</b> {new Date(r.timestamp).toLocaleString()}</p>
                                <p>
                                    <b>Prediction:</b>{" "}
                                    {r.prediction === -1 ? (
                                        <span className="text-red-600 font-semibold">Anomaly</span>
                                    ) : (
                                        <span className="text-green-600 font-semibold">Normal</span>
                                    )}
                                </p>
                                <p>
                                    <b>Score:</b>{" "}
                                    <span className={r.score <= 0 ? "text-red-600" : "text-green-600"}>
                    {r.score.toFixed(4)}
                  </span>
                                </p>
                                <p><b>Log Count:</b> {r.raw_count}</p>
                                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-x-4">
                                    {Object.entries(r.features).map(([k, v]) => (
                                        <p key={k}>
                                            <b>{k}:</b> {v[0].toFixed(4)}
                                        </p>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}