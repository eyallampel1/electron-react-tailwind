// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
    readExcelFile: (filePath) => ipcRenderer.invoke("read-excel-file", filePath),
});