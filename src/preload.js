const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
    generateFromCsv: (path) => ipcRenderer.invoke("generate-from-csv", path),
    onProgressUpdate: (callback) => ipcRenderer.on("progress-update", (_, data) => callback(data)),
    onLogUpdate: (callback) => ipcRenderer.on("log-update", (_, message) => callback(message)),
});