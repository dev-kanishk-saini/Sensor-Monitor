import { SerialPort, ReadlineParser } from "serialport";
import readline from "readline";
import ExcelJS from "exceljs";
import fs from "fs";

const port = new SerialPort({ path: "COM20", baudRate: 256000 });
const parser = new ReadlineParser();

let Mode;
let TargetStatus;
let MovingTargetDistance;
let MovingTargetSignalStrength;
let StaticTargetDistance;
let StaticTargetSignalStrength;
let DetectionDistance;
let MaximumMotionDistanceDoor;
let MaximumStaticDistanceDoor;
let MotionGateValues = [];
let StaticGateValues = [];
let PhotoSensitiveValue;
let Output;

// const fileName = 'sensor_data.xlsx';
// const workbook = new ExcelJS.Workbook();
// const worksheet = workbook.addWorksheet('Sensor Data');

port.pipe(parser);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ---- Convert hex string to buffer ----
function hexStringToBuffer(hexString) {
  return Buffer.from(
    hexString
      .trim()
      .split(" ")
      .map((b) => Number(`0x${b}`))
  );
}

// ---- Both predefined commands ----
const CONFIG_CMD_ENB = hexStringToBuffer(
  "FD FC FB FA 04 00 FF 00 01 00 04 03 02 01"
);

const ENGINEERING_CMD = hexStringToBuffer(
  "FD FC FB FA 02 00 62 00 04 03 02 01"
);

const CONFIG_CMD_DIS = hexStringToBuffer(
  "FD FC FB FA 02 00 FE 00 04 03 02 01"
);

console.log("🔌 Connecting to device...");

// ---- When serial connection opens ----
port.on("open", () => {
  console.log("✅ UART Connected.");

  // Send commands one after the other with slight delay
  setTimeout(() => {
    port.write(CONFIG_CMD_ENB, () => {
      console.log(
        "📤 Sent (Config Mode ON):",
        CONFIG_CMD_ENB.toString("hex").toUpperCase()
      );
    });
  }, 50);

  setTimeout(() => {
    port.write(ENGINEERING_CMD, () => {
      console.log(
        "📤 Sent (Engineering Mode ON):",
        ENGINEERING_CMD.toString("hex").toUpperCase()
      );
    });
  }, 100);

  setTimeout(() => {
    port.write(CONFIG_CMD_DIS, () => {
      console.log(
        "📤 Sent (Config Mode OFF):",
        CONFIG_CMD_DIS.toString("hex").toUpperCase()
      );
    });
  }, 150);
});

let Data = [];

// ---- Incoming Data ----
port.on("data", (data) => {
  const formatted = data
    .toString("hex")
    .toUpperCase()
    .match(/.{1,2}/g)
    ?.map((v) => `${v}`);

  if (!formatted) return;

  Data.push(...formatted);

  if (Data[6] === "01") {
    Mode = "Engineering Mode";
  } else {
    Mode = "Normal Mode";
  }

  let statusByte = Data[6];

  switch (statusByte) {
    case "00":
      TargetStatus = "No Target";
      break;
    case "01":
      TargetStatus = "Movement Target";
      break;
    case "02":
      TargetStatus = "Stationary Target";
      break;
    case "03":
      TargetStatus = "Movement & Stationary Target";
      break;
    case "04":
      TargetStatus = "Background Noise Detection";
      break;
    case "05":
      TargetStatus = "Bottom Noise Detection Successful";
      break;
    case "06":
      TargetStatus = "Bottom Noise Detection Failed";
      break;
    default:
      TargetStatus = "Unknown Status";
  }

  MovingTargetDistance = parseInt(Data[10] + Data[9], 16);
  MovingTargetSignalStrength = parseInt(Data[11], 16);
  StaticTargetDistance = parseInt(Data[13] + Data[12], 16);
  StaticTargetSignalStrength = parseInt(Data[14], 16);
  DetectionDistance = parseInt(Data[16] + Data[15], 16);
  MaximumMotionDistanceDoor = parseInt(Data[17], 16);
  MaximumStaticDistanceDoor = parseInt(Data[18], 16);

  MotionGateValues = [
    parseInt(Data[19], 16),
    parseInt(Data[20], 16),
    parseInt(Data[21], 16),
    parseInt(Data[22], 16),
    parseInt(Data[23], 16),
    parseInt(Data[24], 16),
    parseInt(Data[25], 16),
    parseInt(Data[26], 16),
    parseInt(Data[27], 16),
  ];

  StaticGateValues = [
    parseInt(Data[28], 16),
    parseInt(Data[29], 16),
    parseInt(Data[30], 16),
    parseInt(Data[31], 16),
    parseInt(Data[32], 16),
    parseInt(Data[33], 16),
    parseInt(Data[34], 16),
    parseInt(Data[35], 16),
    parseInt(Data[36], 16),
  ];

  PhotoSensitiveValue = parseInt(Data[37], 16);
  Output = parseInt(Data[38], 16);           

  console.log("\n📥 Received (HEX):", Data);
  console.log(" Mode :", Mode);

 // appendMode(Mode);

//   async function appendMode(modeValue) {
//     const workbook = new ExcelJS.Workbook();
//     let sheet;

//     if (fs.existsSync(fileName) && fs.statSync(fileName).size > 0) {
//       try {
//         await workbook.xlsx.readFile(fileName);
//         sheet = workbook.getWorksheet("Sheet1");
//       } catch (err) {
//         console.log("⚠ Corrupted Excel file detected. Recreating...");
//         fs.unlinkSync(fileName);
//         sheet = workbook.addWorksheet("Sheet1");
//       }
//     } else {
//       sheet = workbook.addWorksheet("Sheet1");
//     }

//     if (!sheet.getCell("A1").value) {
//       sheet.getCell("A1").value = "Mode";
//     }

//     const nextRow = sheet.lastRow.number + 1;
//     sheet.getCell(`A${nextRow}`).value = modeValue;

//     await workbook.xlsx.writeFile(fileName);
//     console.log(`Saved mode '${modeValue}' to row ${nextRow}`);
//   }

//   console.log(" Target Status :", TargetStatus);
//   console.log(" Moving Target Distance (cm) :", MovingTargetDistance);
//   console.log(" Moving Target Signal Strength :", MovingTargetSignalStrength);
//   console.log(" Static Target Distance (cm) :", StaticTargetDistance);
//   console.log(" Static Target Signal Strength :", StaticTargetSignalStrength);
//   console.log(" Photo Sensitive Value :", PhotoSensitiveValue);
//   console.log(" Output :", Output);

  Data.length = 0;
});

//---- User Manual Commands ----
rl.on("line", (input) => {
  const buffer = hexStringToBuffer(input);

  port.write(buffer, () => {
    console.log(`📤 Sent: ${buffer.toString("hex").toUpperCase()}`);
  });
});
