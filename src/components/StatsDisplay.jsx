import React from "react";

export default function StatsDisplay({
                                         selectedHeadOfStaff,
                                         totalHoursStaff,
                                         staffWorkers,
                                         averageHoursPerWorker,
                                         averageWorkerWorkload
                                     }) {
    return (
        totalHoursStaff !== null && (
            <div className="mt-4">
                <h2 className="font-bold text-lg">
                    Total Hours for {selectedHeadOfStaff.label}:
                    <span className="text-blue-500"> {totalHoursStaff}</span>
                </h2>
                <h3 className="font-bold mt-2">
                    Number of Unique Workers: <span className="text-blue-500">{staffWorkers.length}</span>
                </h3>
                <h3 className="font-bold mt-2">
                    Average Working Hours: <span className="text-blue-500">{averageHoursPerWorker.toFixed(2)}</span>
                </h3>
                <h3 className="font-bold mt-2">
                    Average Worker Workload: <span className="text-blue-500">{averageWorkerWorkload.toFixed(2)}%</span>
                </h3>
            </div>
        )
    );
}