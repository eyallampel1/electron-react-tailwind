import React from "react";

export default function WorkerTable({ staffWorkers }) {
    return (
        staffWorkers.length > 0 && (
            <table className="border-collapse border border-gray-500 w-full mt-4">
                <thead>
                <tr>
                    <th className="border border-gray-400 p-2">Worker Name</th>
                    <th className="border border-gray-400 p-2">Total Hours</th>
                    <th className="border border-gray-400 p-2">Workload (%)</th>
                </tr>
                </thead>
                <tbody>
                {staffWorkers.map(({ worker, hours, workload }) => (
                    <tr key={worker} className="border border-gray-400">
                        <td className="border border-gray-400 p-2">{worker}</td>
                        <td className="border border-gray-400 p-2">{hours.toFixed(2)}</td>
                        <td className="border border-gray-400 p-2">{workload.toFixed(2)}%</td>
                    </tr>
                ))}
                </tbody>
            </table>
        )
    );
}