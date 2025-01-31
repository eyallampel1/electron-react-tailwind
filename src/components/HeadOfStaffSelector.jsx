import React from "react";
import Select from "react-select";

export default function HeadOfStaffSelector({
                                                headOfStaffOptions,
                                                selectedHeadOfStaff,
                                                setSelectedHeadOfStaff,
                                                calculateTotalHoursForStaff
                                            }) {
    return (
        <div className="mb-4">
            <label className="block font-bold">Select ראש צוות (Head of Staff):</label>
            <Select
                options={headOfStaffOptions}
                value={selectedHeadOfStaff}
                onChange={setSelectedHeadOfStaff}
                placeholder="Select a Head of Staff"
                isSearchable
                className="w-64"
            />
            <button
                onClick={calculateTotalHoursForStaff}
                className="text-white bg-blue-500 p-2 rounded mt-2 hover:bg-blue-700 transition duration-300"
            >
                Calculate Total Hours for Head of Staff
            </button>
        </div>
    );
}