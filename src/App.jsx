import React, { useState } from "react";
import FileUploader from "./components/FileUploader.jsx";
import HeadOfStaffSelector from "./components/HeadOfStaffSelector.jsx";
import WorkerSelector from "./components/WorkerSelector.jsx";
import WorkerTable from "./components/WorkerTable.jsx";
import StatsDisplay from "./components/StatsDisplay.jsx";

export default function App() {
    const [data, setData] = useState([]);
    const [headOfStaffOptions, setHeadOfStaffOptions] = useState([]);
    const [workerOptions, setWorkerOptions] = useState([]);
    const [selectedHeadOfStaff, setSelectedHeadOfStaff] = useState(null);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [totalHoursStaff, setTotalHoursStaff] = useState(null);
    const [totalHoursWorker, setTotalHoursWorker] = useState(null);
    const [staffWorkers, setStaffWorkers] = useState([]);
    const [averageHoursPerWorker, setAverageHoursPerWorker] = useState(null);
    const [averageWorkerWorkload, setAverageWorkerWorkload] = useState(null);
    const [workerWorkload, setWorkerWorkload] = useState(null);

    // Load Excel Data
    const openFileDialog = async () => {
        const filePath = await window.electron.openFileDialog();
        if (!filePath) return;

        const jsonData = await window.electron.readExcelFile(filePath);
        if (jsonData) {
            setData(jsonData);

            // Ensure unique dropdown options are set
            setHeadOfStaffOptions(
                [...new Set(jsonData.map(row => row["ראש צוות"]?.trim()))] // ✅ Safe access with `?.trim()`
                    .filter(Boolean) // ✅ Remove empty values
                    .map(name => ({ value: name, label: name }))
            );

            setWorkerOptions(
                [...new Set(jsonData.map(row => row["שם העובד"]?.trim()))] // ✅ Safe access with `?.trim()`
                    .filter(Boolean) // ✅ Remove empty values
                    .map(name => ({ value: name, label: name }))
            );
        }
    };


    // ✅ Restored: Calculate Total Hours for Head of Staff
    const calculateTotalHoursForStaff = () => {
        if (!selectedHeadOfStaff) {
            alert("Please select a ראש צוות (Head of Staff).");
            return;
        }

        const filteredRows = data.filter(row => row["ראש צוות"] === selectedHeadOfStaff.value);

        if (filteredRows.length === 0) {
            alert(`No data found for ראש צוות: ${selectedHeadOfStaff.label}`);
            setTotalHoursStaff(null);
            setStaffWorkers([]);
            setAverageHoursPerWorker(null);
            setAverageWorkerWorkload(null);
            return;
        }

        // Calculate total hours
        const totalTeamHours = filteredRows.reduce((sum, row) => {
            const bankHours = parseFloat(row["בנק (שעות שלא נופקו)"]) || 0;
            const systemHours = parseFloat(row["מערכת תכנון שעות"]) || 0;
            return sum + bankHours + systemHours;
        }, 0);
        setTotalHoursStaff(totalTeamHours);

        // Calculate worker breakdown
        const workerMap = new Map();
        filteredRows.forEach(row => {
            const workerName = row["שם העובד"];
            if (!workerName) return;

            const bankHours = parseFloat(row["בנק (שעות שלא נופקו)"]) || 0;
            const systemHours = parseFloat(row["מערכת תכנון שעות"]) || 0;
            const workerTotal = bankHours + systemHours;

            workerMap.set(workerName, (workerMap.get(workerName) || 0) + workerTotal);
        });

        // Convert to array for display
        const workersList = Array.from(workerMap, ([worker, hours]) => ({
            worker,
            hours,
            workload: (hours / 2000) * 100, // Workload as percentage
        }));

        setStaffWorkers(workersList);
        setAverageHoursPerWorker(totalTeamHours / (workersList.length || 1));
        setAverageWorkerWorkload((totalTeamHours / (workersList.length || 1)) / 2000 * 100);
    };

    // ✅ Restored: Calculate Total Hours for Worker
    const calculateTotalHoursForWorker = () => {
        if (!selectedWorker) {
            alert("Please select a שם העובד (Worker).");
            return;
        }

        const filteredRows = data.filter(row => row["שם העובד"] === selectedWorker.value);

        if (filteredRows.length === 0) {
            alert(`No data found for שם העובד: ${selectedWorker.label}`);
            setTotalHoursWorker(null);
            setWorkerWorkload(null);
            return;
        }

        // Summing relevant hours
        const total = filteredRows.reduce((sum, row) => {
            const bankHours = parseFloat(row["בנק (שעות שלא נופקו)"]) || 0;
            const systemHours = parseFloat(row["מערכת תכנון שעות"]) || 0;
            return sum + bankHours + systemHours;
        }, 0);

        setTotalHoursWorker(total);
        setWorkerWorkload((total / 2000) * 100); // Compute workload
    };

    return (
        <div className="p-5">
            <h1 className="font-bold text-xl mb-4">Calculate Total Hours</h1>

            {/* File Uploader */}
            <FileUploader openFileDialog={openFileDialog} />

            {/* 🛠 Only Show Components If Data is Loaded */}
            {data.length > 0 && (
                <>
                    {/* Head of Staff Selection */}
                    <HeadOfStaffSelector
                        headOfStaffOptions={headOfStaffOptions}
                        selectedHeadOfStaff={selectedHeadOfStaff}
                        setSelectedHeadOfStaff={setSelectedHeadOfStaff}
                        calculateTotalHoursForStaff={calculateTotalHoursForStaff}
                    />

                    {/* Stats for Head of Staff */}
                    {totalHoursStaff !== null && (
                        <StatsDisplay
                            selectedHeadOfStaff={selectedHeadOfStaff}
                            totalHoursStaff={totalHoursStaff}
                            staffWorkers={staffWorkers}
                            averageHoursPerWorker={averageHoursPerWorker}
                            averageWorkerWorkload={averageWorkerWorkload}
                        />
                    )}

                    {/* Worker Table */}
                    <WorkerTable staffWorkers={staffWorkers} />

                    {/* Worker Selection */}
                    <WorkerSelector
                        workerOptions={workerOptions}
                        selectedWorker={selectedWorker}
                        setSelectedWorker={setSelectedWorker}
                        calculateTotalHoursForWorker={calculateTotalHoursForWorker}
                    />

                    {/* Display Worker Total Hours */}
                    {totalHoursWorker !== null && selectedWorker && (
                        <div className="mt-4">
                            <h2 className="font-bold text-lg">
                                Total Hours for {selectedWorker.label}:
                                <span className="text-purple-500"> {totalHoursWorker}</span>
                            </h2>
                            <h3 className="font-bold mt-2">
                                Workload: <span className="text-purple-500">{workerWorkload.toFixed(2)}%</span>
                            </h3>
                        </div>
                    )}

                </>
            )}
        </div>
    );
}