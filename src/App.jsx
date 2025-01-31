import React, { useState } from "react";
import Select from "react-select";

export default function App() {
    const [data, setData] = useState([]);
    const [headOfStaffOptions, setHeadOfStaffOptions] = useState([]);
    const [workerOptions, setWorkerOptions] = useState([]);
    const [selectedHeadOfStaff, setSelectedHeadOfStaff] = useState(null);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [totalHoursStaff, setTotalHoursStaff] = useState(null);
    const [totalHoursWorker, setTotalHoursWorker] = useState(null);

    const openFileDialog = async () => {
        const filePath = await window.electron.openFileDialog();
        if (!filePath) return;

        const jsonData = await window.electron.readExcelFile(filePath);
        if (jsonData) {
            setData(jsonData);

            // Extract unique "ראש צוות" names for dropdown
            const uniqueStaffNames = [...new Set(jsonData.map(row => row["ראש צוות"]))].filter(Boolean);
            const staffOptions = uniqueStaffNames.map(name => ({ value: name, label: name }));
            setHeadOfStaffOptions(staffOptions);

            // Extract unique "שם העובד" names for dropdown
            const uniqueWorkerNames = [...new Set(jsonData.map(row => row["שם העובד"]))].filter(Boolean);
            const workerOptions = uniqueWorkerNames.map(name => ({ value: name, label: name }));
            setWorkerOptions(workerOptions);
        }
    };

    const calculateTotalHoursForStaff = () => {
        if (!selectedHeadOfStaff) {
            alert("Please select a ראש צוות (Head of Staff).");
            return;
        }

        const filteredRows = data.filter(row => row["ראש צוות"] === selectedHeadOfStaff.value);

        if (filteredRows.length === 0) {
            alert(`No data found for ראש צוות: ${selectedHeadOfStaff.label}`);
            setTotalHoursStaff(null);
            return;
        }

        // Summing columns J ("בנק (שעות שלא נופקו)") & K ("מערכת תכנון שעות")
        const total = filteredRows.reduce((sum, row) => {
            const bankHours = parseFloat(row["בנק (שעות שלא נופקו)"]) || 0;
            const systemHours = parseFloat(row["מערכת תכנון שעות"]) || 0;
            return sum + bankHours + systemHours;
        }, 0);

        setTotalHoursStaff(total);
    };

    const calculateTotalHoursForWorker = () => {
        if (!selectedWorker) {
            alert("Please select a שם העובד (Worker).");
            return;
        }

        const filteredRows = data.filter(row => row["שם העובד"] === selectedWorker.value);

        if (filteredRows.length === 0) {
            alert(`No data found for שם העובד: ${selectedWorker.label}`);
            setTotalHoursWorker(null);
            return;
        }

        // Summing columns J ("בנק (שעות שלא נופקו)") & K ("מערכת תכנון שעות")
        const total = filteredRows.reduce((sum, row) => {
            const bankHours = parseFloat(row["בנק (שעות שלא נופקו)"]) || 0;
            const systemHours = parseFloat(row["מערכת תכנון שעות"]) || 0;
            return sum + bankHours + systemHours;
        }, 0);

        setTotalHoursWorker(total);
    };

    return (
        <div className="p-5">
            <h1 className="font-bold text-xl mb-4">Calculate Total Hours</h1>

            <button onClick={openFileDialog} className="text-white bg-green-500 p-2 rounded mb-4">
                Select Excel File
            </button>

            {/* Head of Staff Selection */}
            {headOfStaffOptions.length > 0 && (
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
                    <button onClick={calculateTotalHoursForStaff} className="text-white bg-blue-500 p-2 rounded mt-2">
                        Calculate Total Hours for Head of Staff
                    </button>
                </div>
            )}

            {totalHoursStaff !== null && (
                <h2 className="font-bold text-lg mt-4">
                    Total Hours for {selectedHeadOfStaff.label}:
                    <span className="text-blue-500"> {totalHoursStaff}</span>
                </h2>
            )}

            {/* Worker Selection */}
            {workerOptions.length > 0 && (
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
                    <button onClick={calculateTotalHoursForWorker} className="text-white bg-purple-500 p-2 rounded mt-2">
                        Calculate Total Hours for Worker
                    </button>
                </div>
            )}

            {totalHoursWorker !== null && (
                <h2 className="font-bold text-lg mt-4">
                    Total Hours for {selectedWorker.label}:
                    <span className="text-purple-500"> {totalHoursWorker}</span>
                </h2>
            )}
        </div>
    );
}