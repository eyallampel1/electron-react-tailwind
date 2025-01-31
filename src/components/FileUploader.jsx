import React from "react";

export default function FileUploader({ openFileDialog }) {
    return (
        <button
            onClick={openFileDialog}
            className="text-white bg-green-500 p-2 rounded mb-4 hover:bg-green-700 transition duration-300"
        >
            Select Excel File
        </button>
    );
}