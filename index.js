
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { time } from "console";
import autoconfig from "./autoconfig.js";
import setSensitivity from "./setsensitivity.js";
import set_sensitivity_cmd from "./setsensitivity-cmd.js";
import { createPayloadBuffer } from "./check-absence.js";
import path from "path";
import client from "./mqtt.js";
import { getLatestRealtimeData, insertRealtimeData } from "./db/status.repo.js";
import CollectAutoConfigData from "./collectAutoConfigData.js";
import {storeAutoConfigData} from "./db/status.repo.js";

//import sql from "./db.js";


// ------------------ EXPRESS SERVER ------------------
const app = express();
const server = http.createServer(app);
export const io = new Server(server);

app.use(express.static("public")); // serve HTML from /public

server.listen(3001, "0.0.0.0",() => {
  console.log("✅ Web Server running at http://localhost:3001");
});

// ------------------ SERIAL PORT ------------------
export const port = new SerialPort({
// path: "/dev/ttyUSB0", // adjust for your system (e.g., COM3 on Windows)
path : "COM12",
  baudRate: 256000
});




function connect() {
   
  // port.on("open", () => {
  //   console.log("✅ Serial connected");
  // });

    
port.on("open", () => {
  console.log("✅ UART Connected");

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
    port.write(initCommand, (err) => {
        if (err) {
          console.error("❌ Serial Write Error:", err.message);
          return;
        }

        console.log("📤 Sent:", initCommand.toString("hex").toUpperCase());
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

  startAutoConfigScheduler();

});




  port.on("error", (err) => {
    console.log("Retrying in 3 seconds...");
    setTimeout(connect, 3000);
  });

//   port.on("close", () => {
//   console.error("⚠ Serial Port Closed");
// });
  port.on("close", () => {
    console.log("⚠ Serial closed. Reconnecting...");
    setTimeout(connect, 3000);
  });
}

connect();


getLatestRealtimeData()


 const onpayload = createPayloadBuffer(
         () => MotionSensitivity,
         () => StaticSensitivity
       )

   let lastEmit = 0;

   let maxmotionvalues = [0, 0, 0, 0, 0, 0, 0, 0,0];
      let maxstaticvalues = [0, 0, 0, 0, 0, 0, 0, 0,0];
      let MotionSensitivity = [] ;
      let StaticSensitivity = [] ;
      let dataArray = [];
      let motiongatecount = [0,0,0,0,0,0,0,0,0];
      let staticgatecount = [0,0,0,0,0,0,0,0,0];
      let config = false;
      let isAutoConfig = false;
      let  AutoConfigData = [];
      let autoConfigRunning = false;



/**
 * Updates sensitivities and emits change event if values actually changed
 */
function updateSensitivities(newMotion, newStatic) {
  const motionChanged =
    JSON.stringify(MotionSensitivity) !== JSON.stringify(newMotion);

  const staticChanged =
    JSON.stringify(StaticSensitivity) !== JSON.stringify(newStatic);

  if (!motionChanged && !staticChanged) return;

  MotionSensitivity = [...newMotion];
  StaticSensitivity = [...newStatic];

  console.log("🔄 Sensitivities Updated");

  const data = {
    MotionSensitivity,
    StaticSensitivity
  };

  io.emit("sensitivityUpdated", data);
}


const calculateResult = () => {
  
      motiongatecount = [0,0,0,0,0,0,0,0,0];
      staticgatecount = [0,0,0,0,0,0,0,0,0];
       // console.log(dataArray);
     dataArray.forEach((data) => {
       
     data.data.MotionGateValues.forEach((v,i) => {
      if(v > MotionSensitivity[i]){
        motiongatecount[i] += 1;
      }
     });


       data.data.StaticGateValues.forEach((v,i) => {
    if(v > StaticSensitivity[i]){
       staticgatecount[i] += 1;
    }
  });
     
  })
       
      io.emit("configuredataset",{motiongatecount,staticgatecount,dataArray});

      const newsensitivity_data = autoconfig(dataArray,MotionSensitivity,StaticSensitivity);
      setSensitivity({newsensitivity_data, MotionSensitivity,StaticSensitivity});

};




export function hexStringToBuffer(hexString) {
  return Buffer.from(
    hexString
      .trim()
      .split(" ")
      .map((b) => Number(`0x${b}`))
  );
}

// ------------------ COMMANDS ------------------
 export const CONFIG_CMD_ENB = hexStringToBuffer(
  "FD FC FB FA 04 00 FF 00 01 00 04 03 02 01"
);

export const ENGINEERING_CMD = hexStringToBuffer(
  "FD FC FB FA 02 00 62 00 04 03 02 01"
);

export const ENGINEERING_CMD_OFF = hexStringToBuffer(
  "FD FC FB FA 02 00 63 00 04 03 02 01"
);

export const CONFIG_CMD_DIS = hexStringToBuffer(
  "FD FC FB FA 02 00 FE 00 04 03 02 01"
);

export const AUTO_CONFIG_CMD = hexStringToBuffer(
  "FD FC FB FA 04 00 0B 00 3C 00 04 03 02 01"
)

export const initCommand = hexStringToBuffer(
  "FD FC FB FA 02 00 61 00 04 03 02 01"
);




// ------------------ SERIAL CONNECT ------------------






let Data = [];

// ------------------ SENSOR DATA READ ------------------
port.on("data", (data) => {
  if (!data || data.length === 0) return;

  // console.log("Motion Sensitivity",MotionSensitivity);
  //   console.log("Static Sensitivity",StaticSensitivity);


  const hexString = data.toString("hex").toUpperCase();
  const formatted = hexString.match(/.{1,2}/g)?.map((v) => `${v}`);
  //console.log("🔵 Raw Data:", formatted);

  // ✅ SAFETY CHECK (THIS FIXES YOUR CRASH)
  if (!formatted) return;

  Data.push(...formatted);


  // Process ONLY complete frames
  while (Data.length >= 38) {

   
    const frame = Data.splice(0, 39); // take exactly one full packet

  const hexFrame = frame.map(b =>
        b.toString(16).padStart(2, "0").toUpperCase()
      );
     const commandWord = hexFrame[6];

    switch (commandWord) {
      case "01": // Live sensor data
          try {
    

      let Mode = hexFrame[6] === "01" ? "Engineering Mode" : "Normal Mode";

      let TargetStatus;
      switch (hexFrame[6]) {
        case "00": TargetStatus = "No Target"; break;
        case "01": TargetStatus = "Movement Target"; break;
        case "02": TargetStatus = "Stationary Target"; break;
        case "03": TargetStatus = "Movement & Stationary Target"; break;
        default: TargetStatus = "Unknown";
      }


        let  MotionGateValues  = hexFrame.slice(19, 28).map(v => parseInt(v, 16));
        let StaticGateValues = hexFrame.slice(28, 37).map(v => parseInt(v, 16));

  

      maxmotionvalues.forEach((v,i) => {
        if(MotionGateValues[i] > v){
          maxmotionvalues[i] = MotionGateValues[i];
        }
        return;
      })

        maxstaticvalues.forEach((v,i) => {
        if(StaticGateValues[i] > v){
          maxstaticvalues[i] = StaticGateValues[i];
        }
        return;
      })




      const payload = {
        Mode,
        TargetStatus,
        MovingTargetDistance: parseInt(hexFrame[10] + hexFrame[9], 16),
        MovingTargetSignalStrength: parseInt(hexFrame[11], 16),
        StaticTargetDistance: parseInt(hexFrame[13] + hexFrame[12], 16),
        StaticTargetSignalStrength: parseInt(hexFrame[14], 16),
        DetectionDistance:  parseInt(hexFrame[16] + hexFrame[15], 16) ,
        MaximumMotionDistanceDoor: parseInt(hexFrame[17], 16),
        MaximumStaticDistanceDoor: parseInt(hexFrame[18], 16),
        // MotionGateValues: hexFrame.slice(19, 28).map(v => parseInt(v, 16)),
        // StaticGateValues: hexFrame.slice(28, 37).map(v => parseInt(v, 16)),
        MotionGateValues,
        StaticGateValues,
        maxmotionvalues,
        maxstaticvalues,
        PhotoSensitiveValue: parseInt(hexFrame[37], 16),
        Output: parseInt(hexFrame[38], 16)
      };
    //  console.log("📡 dATA", payload);
      insertRealtimeData(payload);
      
      onpayload(payload);
   
 
       if(config){
       
        const dataset = {
          data : payload,
          time : new Date().toLocaleTimeString()
        }
         
        dataArray.push (dataset);
        console.log(dataset)
      }

      if(isAutoConfig){
         
          AutoConfigData.push(payload);
      }
 

     //console.log("📡 DetectionDistance:", payload.DetectionDistance);
     const now = Date.now();
if (now - lastEmit > 50) {   // 20 updates/sec
  io.emit("sensorData", payload);
  lastEmit = now;
}


    } catch (err) {
      console.error("❌ Packet Parse Error:", err);
    };
    break;

      case "61": // Configuration data
    try {
      console.log("🔷 Config Data Raw:", hexFrame);
    const ackStatus = parseInt(hexFrame[7], 16);

    const maxDistanceGateN = parseInt(hexFrame[11], 16);
    const motionDistanceGate = parseInt(hexFrame[12], 16);
    const staticDistanceGate = parseInt(hexFrame[13], 16);

    const motionSensitivity = hexFrame
      .slice(14, 23)
      .map(v => parseInt(v, 16));

    const staticSensitivity = hexFrame
      .slice(23, 32)
      .map(v => parseInt(v, 16));

    // MotionSensitivity = motionSensitivity;
    // StaticSensitivity = staticSensitivity;
    updateSensitivities(motionSensitivity, staticSensitivity);


    const unmannedDuration =
      parseInt(hexFrame[33] + hexFrame[32], 16); // little-endian → seconds

    const configPayload = {
      command: "READ_PARAMETER_RESPONSE",
      ackStatus,
      maxDistanceGateN,
      motionDistanceGate,
      staticDistanceGate,
      motionSensitivity,
      staticSensitivity,
      unmannedDuration
    };

    console.log("⚙ CONFIG DATA:", configPayload);

    io.emit("configurationData", configPayload);

  } catch (err) {
    console.error("❌ Config Decode Error:", err);
  }
        break; // valid commands, proceed


      default:
        console.warn("⚠ Unknown command word:", commandWord);
        continue; // skip invalid packet
    }


  }




  Data.length = 0; // reset buffer
});


// port.on("error", (err) => {
//   console.error("❌ Serial Port Error:", err.message);


// });

function startAutoConfigScheduler() {

  console.log("⏱ AutoConfig scheduler started (every 1 hour)");

  // run first time after 1 minute (optional)
  setTimeout(() => {
    runAutoConfig();
  }, 60000);

  // run every 1 hour
  setInterval(() => {
    runAutoConfig();
  }, 60 * 60 * 1000);

}




async function runAutoConfig() {

  if (autoConfigRunning) {
    console.log("⚠ AutoConfig already running. Skipping.");
    return;
  }

  if (!port.isOpen) {
    console.warn("⚠ Serial port not open. AutoConfig skipped.");
    return;
  }

  autoConfigRunning = true;

  try {

    port.write(CONFIG_CMD_ENB);
    console.log("📤 Sent (Config Mode ON)");

    isAutoConfig = true;
    AutoConfigData = [];

    console.log("⚙ AUTO CONFIG started !!!!!");

    port.write(AUTO_CONFIG_CMD);
    console.log("📤 Sent (Auto Config Command)");

    setTimeout(async () => {

      try {

        isAutoConfig = false;

        if (port.isOpen) {
          port.write(CONFIG_CMD_ENB);
          port.write(initCommand);
          port.write(CONFIG_CMD_DIS);
        }

        const collectedData = CollectAutoConfigData(
          AutoConfigData,
          MotionSensitivity,
          StaticSensitivity
        );

        await storeAutoConfigData(collectedData);

        console.log("✅ AUTO CONFIG DONE !!!!!");

      } catch (err) {
        console.error("❌ AutoConfig processing failed:", err);
      } finally {

        autoConfigRunning = false;

      }

    }, 60000);

    port.write(CONFIG_CMD_DIS);

  } catch (err) {

    autoConfigRunning = false;
    console.error("❌ AutoConfig failed:", err);

  }
}









// ------------------ SOCKET.IO ------------------
io.on("connection", (socket) => {
  console.log("🌐 Browser Connected");
    console.log(socket.id);
    socket.emit("socketID", socket.id);

  socket.on("sendCommand", (hexCommand) => {
    const buffer = hexStringToBuffer(hexCommand);
    if (port.isOpen) {
      port.write(CONFIG_CMD_ENB, () => {
      console.log(
        "📤 Sent (Config Mode ON):",
        CONFIG_CMD_ENB.toString("hex").toUpperCase()
      );
    });

     port.write(ENGINEERING_CMD, () => {
      console.log(
        "📤 Sent (Engineering Mode ON):",
        ENGINEERING_CMD.toString("hex").toUpperCase()
      );
    });

     
      port.write(buffer, (err) => {
        if (err) {
          console.error("❌ Serial Write Error:", err.message);
          return;
        }

        console.log("📤 Sent:", hexCommand);
      });

 port.write(CONFIG_CMD_DIS, () => {
      console.log(
        "📤 Sent (Config Mode OFF):",
        CONFIG_CMD_DIS.toString("hex").toUpperCase()
      );
    });

    } else {
      console.warn("⚠ Serial port not open. Command not sent.");
    }
    
  });

  socket.on("toggleEngineeringMode", () => {
    if (port.isOpen) {
      port.write(CONFIG_CMD_ENB, () => {
      console.log(
        "📤 Sent (Config Mode ON):",
        CONFIG_CMD_ENB.toString("hex").toUpperCase()
      );
    });

     port.write(ENGINEERING_CMD_OFF, () => {
      console.log(
        "📤 Sent (Engineering Mode OFF):",
        ENGINEERING_CMD_OFF.toString("hex").toUpperCase()
      );
    });

     

 port.write(CONFIG_CMD_DIS, () => {
      console.log(
        "📤 Sent (Config Mode OFF):",
        CONFIG_CMD_DIS.toString("hex").toUpperCase()
      );
    });

    } else {
      console.warn("⚠ Serial port not open. Command not sent.");
    }
  });


  socket.on("resetmaxvaluemotion",()=>{
    maxmotionvalues = [0, 0, 0, 0, 0, 0, 0, 0,0];
  });

  socket.on("resetmaxvaluestatic",()=> {
   maxstaticvalues = [0, 0, 0, 0, 0, 0, 0, 0,0];
  });



//Function for starting and stopping the Customized Calibration.


  socket.on("task : control" , ({action}) => {

    if(action === "start"){
          config = true;
          console.log(config);
    }else if (action === "stop"){
      config = false;
          console.log(config);

            calculateResult();
           
          socket.emit("dataArray", dataArray);

    }
     
  });

 //Function for setting  sensitivity manually..



  socket.on("setsensitivity",(data)=>{
            const data_object = {
              data : data,
              ms : MotionSensitivity,
              ss : StaticSensitivity
            };

            set_sensitivity_cmd(data_object);
    ``    
  });

  //Function for running AutoConfig Calibration.

  socket.on("autoconfig", async () => {
  await runAutoConfig();
});


  // socket.on("autoconfig",() =>{
  //  // console.log("Auto config");
  //       if (port.isOpen) {
  //               port.write(CONFIG_CMD_ENB, () => {
  //               console.log(
  //                 "📤 Sent (Config Mode ON):",
  //                 CONFIG_CMD_ENB.toString("hex").toUpperCase()
  //               );
  //             });

  //               isAutoConfig = true;
                
  //                                console.log("AUTO CONFIG started !!!!!");

  //              port.write(AUTO_CONFIG_CMD, () => {
  //                console.log(
  //                 "📤 Sent (Auto Config Command):",
  //                 AUTO_CONFIG_CMD.toString("hex").toUpperCase()
  //               );
  //             });
      
  //             setTimeout(async() => {
  //                    isAutoConfig = false;

                    
  //                     if (port.isOpen) {
  //               port.write(CONFIG_CMD_ENB, () => {
  //               console.log(
  //                 "📤 Sent (Config Mode ON):",
  //                 CONFIG_CMD_ENB.toString("hex").toUpperCase()
  //               );
  //             });

                
                

  //              port.write(initCommand, () => {
  //                console.log(
  //                 "📤 Sent (Init Command):",
  //                 initCommand.toString("hex").toUpperCase()
  //               );
  //             });
      
             

  //             port.write(CONFIG_CMD_DIS, () => {
  //               console.log(
  //                 "📤 Sent (Config Mode OFF):",
  //                 CONFIG_CMD_DIS.toString("hex").toUpperCase()
  //               );
  //             });
          
  //             } else {
  //               console.warn("⚠ Serial port not open. Command not sent. Failed to SET the Sensitivity");
  //             }



  //                 const collectedData =  CollectAutoConfigData(AutoConfigData,MotionSensitivity, StaticSensitivity);
  //                 await storeAutoConfigData(collectedData);
  //                 console.log("AUTO CONFIG dONE !!!!!");





                    
  //               }, 60000);

  //             port.write(CONFIG_CMD_DIS, () => {
  //               console.log(
  //                 "📤 Sent (Config Mode OFF):",
  //                 CONFIG_CMD_DIS.toString("hex").toUpperCase()
  //               );
  //             });
          
  //             } else {
  //               console.warn("⚠ Serial port not open. Command not sent. Failed to SET the Sensitivity");
  //             }

  // });

  socket.on("getData", () => {
    console.log("Received Data Request!");
    getLatestRealtimeData().then((data) => {
      socket.emit("latestData", data);
    }).catch((err) => {
      console.error("❌ Failed to SEND latest data:", err);
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ Browser Disconnected");
  });
});
