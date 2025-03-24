import React, {useEffect, useState} from "react";

export default function App() {
    const [status, setStatus] = useState("Waiting for file...");
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ count: 0, total: 0 });
    const [logMessages, setLogMessages] = useState([]);

    useEffect(() => {
        window.electron.onProgressUpdate(({ count, total }) => {
            setProgress({ count, total });
        });

        window.electron.onLogUpdate((msg) => {
            setLogMessages(prev => [...prev, msg]);
        });
    }, []);

    React.useEffect(() => {
        window.electron.onProgressUpdate(({ count, total }) => {
            setProgress({ count, total });
        });
    }, []);


    const handleCsvUpload = async () => {
        setStatus("Opening file dialog...");
        const filePath = await window.electron.openFileDialog();

        if (!filePath) {
            setStatus("No file selected.");
            return;
        }

        setStatus("Processing CSV...");
        setIsProcessing(true);

        const result = await window.electron.generateFromCsv(filePath);

        if (result?.success) {
            setStatus(result.message || "✅ All done!");
        } else {
            setStatus("❌ Error: " + (result?.message || "Unknown error"));
        }


        setIsProcessing(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">
                    EasyEDA LCSC Symbol Generator
                </h1>
                <p className="text-gray-600 mb-6">
                    Select a CSV BOM file and generate symbols using
                    <br />
                    <code>easyeda2kicad.exe --full --lcsc_id=XXX</code>
                </p>
                <button
                    onClick={handleCsvUpload}
                    disabled={isProcessing}
                    className={`px-6 py-3 font-medium rounded text-white ${
                        isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {isProcessing ? `Processing... (${progress.count}/${progress.total})` : "Select CSV and Run"}
                </button>

                {isProcessing && (
                    <div className="w-full bg-gray-200 rounded-full h-4 mt-4 overflow-hidden">
                        <div
                            className="bg-green-500 h-4 transition-all duration-200"
                            style={{
                                width:
                                    progress.total > 0
                                        ? `${Math.round((progress.count / progress.total) * 100)}%`
                                        : "0%",
                            }}
                        ></div>
                    </div>
                )}

                {isProcessing && (
                    <div className="mt-4 max-h-48 overflow-y-auto bg-gray-100 p-3 rounded text-left text-sm border border-gray-300">
                        {logMessages.map((msg, index) => (
                            <div key={index} className="font-mono">{msg}</div>
                        ))}
                    </div>
                )}


                <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
                    {status}
                </div>
            </div>
        </div>
    );
}