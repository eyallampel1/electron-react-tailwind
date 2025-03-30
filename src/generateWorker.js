const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");
const { parse } = require("csv-parse/sync");
const { execSync } = require("child_process");

function processCSV(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    const records = parse(content, { columns: true, skip_empty_lines: true });

    const lcscSet = new Set();
    for (const row of records) {
        const id = row["LCSC Part"]?.trim();
        if (id) lcscSet.add(id);
    }

    const total = lcscSet.size;
    let count = 0;
    let addedCount = 0;
    let alreadyExistsCount = 0;
    let errorCount = 0;

    for (const id of lcscSet) {
        let status = "";
        try {
            const result = execSync(
                `easyeda2kicad.exe --full --lcsc_id=${id}`,
                { encoding: "utf-8" }
            );


            // Log raw result to understand behavior
            parentPort.postMessage({ type: "log", message: `🖨️ ${id} OUTPUT:\n${result.trim()}` });

            if (result.includes("already in") || result.includes("Use --overwrite")) {
                alreadyExistsCount++;
                status = `⚠️ ${id} - Already exists`;
            } else {
                addedCount++;
                status = `✅ ${id} - Added`;
            }
        } catch (error) {
            const output =
                (error.stdout?.toString() || "") + "\n" +
                (error.stderr?.toString() || "") + "\n" +
                error.message;

            parentPort.postMessage({
                type: "log",
                message: `❗ ${id} ERROR OUTPUT:\n${output.trim()}`
            });

            if (output.includes("already in") || output.includes("Use --overwrite")) {
                alreadyExistsCount++;
                status = `⚠️ ${id} - Already exists (caught from error)`;
            } else {
                errorCount++;
                status = `❌ ${id} - Error`;
            }
        }


        count++;
        parentPort.postMessage({ type: "log", message: status });
        parentPort.postMessage({ type: "progress", count, total });
    }



    parentPort.postMessage({
        type: "done",
        addedCount,
        alreadyExistsCount,
        errorCount,
    });
}

processCSV(workerData.filePath);