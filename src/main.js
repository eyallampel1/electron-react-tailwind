const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const { Worker } = require("worker_threads");
let currentWorker = null;

if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

// Handle file selection
ipcMain.handle("open-file-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Excel Files", extensions: ["csv","xlsx", "xls","xlsm"] }],
  });

  return result.filePaths[0] || null;
});

// Handle reading the Excel file
ipcMain.handle("read-excel-file", async (_, filePath) => {
  if (!filePath) return null;

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    // Ensure the target sheet exists
    const targetSheetName = "חלוקת פקעות"; // Hebrew sheet name
    if (!workbook.SheetNames.includes(targetSheetName)) {
      console.error(`Sheet '${targetSheetName}' not found.`);
      return null; // Return null if the sheet doesn't exist
    }

    const sheet = workbook.Sheets[targetSheetName];

    // Define a range to skip rows 1-4 (start at row 5, column C to R)
    const range = XLSX.utils.decode_range(sheet["!ref"]);
    range.s.r = 4; // Start at row 5 (zero-based index: row 5 = index 4)
    range.s.c = 2; // Start from column C
    range.e.c = 17; // End at column R

    // Convert sheet to JSON with the specified range
    const jsonData = XLSX.utils.sheet_to_json(sheet, { range });

    return jsonData;
  } catch (error) {
    console.error("Error reading Excel file:", error);
    return null;
  }
});

const { parse } = require("csv-parse/sync");
const { execSync } = require("child_process");
// Handle running easyeda2kicad for each LCSC Part in a CSV
ipcMain.handle("generate-from-csv", async (event, filePath) => {
  return new Promise((resolve, reject) => {
    currentWorker = new Worker(path.resolve(app.getAppPath(), "src/generateWorker.js"), {
      workerData: { filePath },
    });

    let wasCancelled = false;

    currentWorker.on("message", (msg) => {
      if (msg.type === "progress") {
        event.sender.send("progress-update", { count: msg.count, total: msg.total });
      } else if (msg.type === "log") {
        event.sender.send("log-update", msg.message);
      } else if (msg.type === "done") {
        currentWorker = null;
        resolve({
          success: true,
          message: `✅ ${msg.addedCount} added\n⚠️ ${msg.alreadyExistsCount} already existed\n❌ ${msg.errorCount} errors`,
        });
      }
    });

    currentWorker.on("error", (err) => {
      console.error("Worker error:", err);
      currentWorker = null;
      reject({ success: false, message: "Worker thread failed" });
    });

    currentWorker.on("exit", (code) => {
      if (code !== 0 && !wasCancelled) {
        reject({ success: false, message: `Worker stopped unexpectedly (code ${code})` });
      }
      if (wasCancelled) {
        reject({ success: false, message: `⛔ Generation was cancelled.` });
      }
      currentWorker = null;
    });

    // expose cancel function inside the closure
    ipcMain.once("cancel-current-worker", () => {
      wasCancelled = true;
      currentWorker?.terminate();
    });
  });
});


ipcMain.handle("cancel-generation", async () => {
  if (currentWorker) {
    currentWorker.terminate();
    currentWorker = null;
    return { success: true, message: "⛔ Generation cancelled by user." };
  } else {
    return { success: false, message: "No generation in progress." };
  }
});


app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});