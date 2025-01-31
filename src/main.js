const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("fs");
const XLSX = require("xlsx");

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
    filters: [{ name: "Excel Files", extensions: ["xlsx", "xls","xlsm"] }],
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