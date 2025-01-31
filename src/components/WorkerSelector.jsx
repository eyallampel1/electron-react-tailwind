import React from "react";
import Select from "react-select";

export default function WorkerSelector({
                                           workerOptions,
                                           selectedWorker,
                                           setSelectedWorker,
                                           calculateTotalHoursForWorker
                                       }) {
    return (
        <div className="mb-4">
            <label className="block font-bold">Select שם העובד (Worker):</label>
            <Select
                options={workerOptions}
                value={selectedWorker}
                onChange={setSelectedWorker}
                placeholder="Select a Worker"
                isSearchable
                className="w-64"
            />
            <button
                onClick={calculateTotalHoursForWorker}
                className="text-white bg-purple-500 p-2 rounded mt-2 hover:bg-purple-700 transition duration-300"
            >
                Calculate Total Hours for Worker
            </button>
        </div>
    );
}