// ================= SOCKET SAFE INIT =================
if (!window.socket) {
  window.socket = io();
}
const socket = window.socket;

// ================= WAIT FOR DOM =================

window.addEventListener("DOMContentLoaded", () => {

    // ✅ REGISTER DATALABELS PLUGIN GLOBALLY
  if (typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
    console.log("✅ ChartDataLabels plugin registered");
  } else {
    console.warn("⚠️ ChartDataLabels plugin not found. Labels won't display.");
  }

  const initCommand = "FD FC FB FA 02 00 61 00 04 03 02 01"; // example hex
  socket.emit("sendCommand", initCommand);
  console.log("✅ Init command sent to sensor");

  const reset = document.getElementById("resetZoomBtn");
   const motionChartTypeSelect = document.getElementById("motionChartType");
  const staticChartTypeSelect = document.getElementById("staticChartType");
   const switchmode = document.getElementById("mode");
   const resetmaxmotion = document.getElementById("resetmaxvaluemotion");
   const resetmaxstatic = document.getElementById("resetmaxvaluestatic");
   const selectgatetype = document.getElementById("selectgatetype");
     const selectgatenumber = document.getElementById("selectgateno");
     const selectgatevalue = document.getElementById("selectgatevalue");
     const setSensitivity = document.getElementById("setsensitivity");
   
  //  const startconfig = document.getElementById("startconfig");
  //  const stopconfig = document.getElementById("stopconfig");

  


    let Distances = [];


  // labels for 8 gates
  const gateLabels = ["Gate 1","Gate 2","Gate 3","Gate 4","Gate 5","Gate 6","Gate 7","Gate 8"];

  const commonOptions = {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category", 
         title: { display: true, text: "Gate" } },
      y: { title: { display: true, text: "Signal (0 - 100)" }, 
      min: 0,
       max: 120 }
    },
    plugins: {
      legend: { display: false },
       datalabels: {
        display: false  // disable for line datasets by default
      }
    }
  };

  // ================= MOTION CHART =================
  const motionCanvas = document.getElementById("motionChart");
  if (!motionCanvas) {
    console.error("❌ motionChart canvas not found in DOM");
    return;
  }

  const motionChart = new Chart(motionCanvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: gateLabels,
      datasets: [{
        label: "Motion Gate Signal",
        data: Array(8).fill(0),
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 5,
         borderColor: "#3b82f6",
        backgroundColor: "rgba(7, 132, 204, 0.72)",
        datalabels: {
            display: true,
            anchor : "end",
            align : "bottom",
            offset : -20,
             color: '#ffffff',        // ✅ White text for visibility
        font: {
          size: 17,
          weight: 'bold'
        },
        formatter: function(value) {
          return value;          // ✅ Display the actual value
        } // ✅ explicitly disable for this dataset
          },
          
      },
        {
          
          label: "Motion Threshold",
          data: Array(8).fill(0),     // ✅ added dataset
          borderWidth: 2,
          borderDash: [6, 6],         // ✅ dashed line
          tension: 0.3,
          pointRadius: 0,
          borderColor: "#f66009ff",
          backgroundColor: "#fe6f2dff",
          datalabels: {
            display: false  // ✅ explicitly disable for this dataset
          },
            
        },
        {
          type: "scatter",
          label: "Max Value Hit",
          data: [], 
          parsing : false,
          pointRadius: 5,
          pointHoverRadius: 8,  
          showLine: false,
          backgroundColor: "#22c55e", // ✅ GREEN color
          borderColor: "#07461eff",
            datalabels: {
            display: true,
            align: "top",
            offset: 8,
            color: "#22c55e",
            font: {
              size: 15,
              weight: "bold"
            },
            formatter: function(value) {
              return value && value.y ? value.y : '';
            }
          }
        }

    
              ]
    },
    options: commonOptions
  });

  // ================= STATIC CHART =================
  const staticCanvas = document.getElementById("staticChart");
  if (!staticCanvas) {
    console.error("❌ staticChart canvas not found in DOM");
    return;
  }

  const staticChart = new Chart(staticCanvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: gateLabels,
      datasets: [{
        label: "Static Gate Signal",
        data: Array(8).fill(0),
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 5,
           borderColor: "#3b82f6",
        backgroundColor: "rgba(7, 132, 204, 0.72)",
               datalabels: {
            display: true,
            anchor : "start",
            align : "bottom",
            offset : -20,
             color: '#ffffff',        // ✅ White text for visibility
        font: {
          size: 17,
          weight: 'bold'
        },
        formatter: function(value) {
          return value;          // ✅ Display the actual value
        } // ✅ explicitly disable for this dataset
          },
      },
     {
          
          label: "Static Threshold",
          data: Array(8).fill(0),     // ✅ added dataset
          borderWidth: 2,
          borderDash: [6, 6],
          tension: 0.3,
          borderColor: "#f66009ff",
          backgroundColor: "#fe6f2dff",
          pointRadius: 0,
           datalabels: {
            display: false  // ✅ explicitly disable for this dataset
          }
        },
        {
          type: "scatter",
          label: "Max Value Hit",
          data:[], 
          parsing : false,
          pointRadius: 5,
          pointHoverRadius: 8,
          showLine: false,
         backgroundColor: "#22c55e", // ✅ GREEN color
          borderColor: "#07461eff",
          datalabels: {
            display: true,
            align: "top",
            offset: 8,
            color: "#22c55e",
            font: {
              size: 15,
              weight: "bold"
            },
           formatter: function(value) {
              return value && value.y ? value.y : '';
            }
          }
 
        }
]
    },
    options: commonOptions
  });

  //  const DistanceLabels = ["10","20","30","40","50","60","70","80"];

  const distanceOptions = {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    parsing : false,
    scales: {
      x: {
        type : "time" ,
        time: {
          unit: "second",
          tooltipFormat: "HH:mm:ss"
        },
         title: { display: true, text: "Time" } 
        },
      y: { 
        title: { display: true, text: "Detection Distance" }, 
        min: 0,
        max: 700 }
    },
    plugins: {
      legend: { display: true },
      zoom : {
        zoom : {
             wheel: { enabled: true ,
              modifierKey : null
             },
          pinch: { enabled: true },
          mode: "x"
        },
        pan : {
          enabled: true,
          mode: "xy"
        },
        
      },
      datalabels: {
        display: false  // ✅ disable labels for distance chart
      },
    },
    
  };


  // ================= DETECTION DISTANCE  CHART =================
  const detectionCanvas = document.getElementById("detectionChart");
  if (!detectionCanvas) {
    console.error("❌ detectionChart canvas not found in DOM");
    return;
  }

//   detectionCanvas.addEventListener("wheel", (e) => {
//   e.preventDefault();     // prevent page zoom
// }, { passive: false });

  const detectionChart = new Chart(detectionCanvas.getContext("2d"), {
    type: "line",
    data: {
    //  labels: gateLabels,
      datasets: [{
        label: "Detection Distance (Live)",
        data: Distances,
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0,

      },
     ]
    },
   options:{
  ...distanceOptions,
  plugins : {
     ...distanceOptions.plugins, 
    datalabels : {
      display : (context) => {
        return context.dataIndex === context.dataset.data.length - 1;
      },

      // ✅ SHOW DISTANCE (y)
      formatter: (value) => `${value.y} cm`,

      align: "top",
      anchor: "end",
      offset: 8,
      font: {
        weight: "bold",
        size: 20
      },
      color: "rgba(238, 237, 237, 1)",
    },

    legend: { display: false }
  }
},
    plugins: [ChartDataLabels]
  });











  // ================= SANITIZER =================
  function sanitizeVal(v) {
    const n = Number(v);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }


  // ================= SOCKET DATA =================
  socket.on("sensorData", (payload) => {
    const motionRaw = Array.isArray(payload.MotionGateValues) ? payload.MotionGateValues : [];
    const staticRaw = Array.isArray(payload.StaticGateValues) ? payload.StaticGateValues : [];
    const maxmotion = Array.isArray(payload.maxmotionvalues) ? payload.maxmotionvalues : [];
    const maxstatic = Array.isArray(payload.maxstaticvalues) ? payload.maxstaticvalues : [];
    const mode = payload.Mode || "Unknown";
   

    if(mode === "Engineering Mode"){
      document.getElementById("mode").style.backgroundColor = "#369d21ff";
      document.getElementById("mode").innerText = "Exit Eng Mode";
    } else {
      document.getElementById("mode").style.backgroundColor = "#f24119ff";
      document.getElementById("mode").innerText = "StartEng Mode";
    }





      const detectionDistance =
    typeof payload.DetectionDistance === "number"
      ? payload.DetectionDistance
      : 0;

     const now = Date.now();


    // Distances.push(detectionDistance);

     Distances.push({
    x: now,
    y: detectionDistance
  });

    // ✅ Optional auto limit (prevents browser crash after hours)
  const MAX_POINTS = 5000;
  if (Distances.length > MAX_POINTS) {
    Distances.shift();
  }

 //   console.log("📡 Updated DetectionDistance:", Distances);

    const motionArr = [];
    const staticArr = [];

    for (let i = 0; i < 8; i++) {
      motionArr.push(sanitizeVal(motionRaw[i]));
      staticArr.push(sanitizeVal(staticRaw[i]));
      
    }

     const motionMarkers = [];
     const staticMarkers = [];

    const mm = maxmotion.slice(0, 8);
    const ms = maxstatic.slice(0, 8);

    


      for (let i = 0; i < mm.length; i++) {
    const v = typeof mm[i] === "number" ? mm[i] : Number(mm[i]);
    if (!Number.isNaN(v)) {
         motionMarkers.push({
      x: gateLabels[i],     // ✅ FIXED
      y: sanitizeVal(v)
    });
//     motionMarkers[i] = {
//   x: gateLabels[i],
//   y: sanitizeVal(v)
// };
    }
  }

for (let i = 0; i < ms.length; i++) {
  const v = typeof ms[i] === "number" ? ms[i] : Number(ms[i]);
  if (!Number.isNaN(v)) {
    staticMarkers.push({   // ✅ CORRECT ARRAY
      x: gateLabels[i],
      y: sanitizeVal(v)
    });
//      staticMarkers[i] = {
//   x: gateLabels[i],
//   y: sanitizeVal(v)
// };
  }
}

//console.log("Motion Markers:", motionMarkers);
//console.log("Static Markers:", staticMarkers);



    motionChart.data.datasets[0].data = motionArr;
    staticChart.data.datasets[0].data = staticArr
    motionChart.data.datasets[2].data = motionMarkers;
    staticChart.data.datasets[2].data = staticMarkers;
    detectionChart.data.datasets[0].data = Distances;

    // motionChart.data.datasets[2].data = maxmotion;
    // staticChart.data.datasets[2].data = maxstatic;

    motionChart.update("none");
    staticChart.update("none");
    detectionChart.update("none");

  //  console.log("Max Motion Values :",payload.maxmotionvalues);
  //  console.log(`Max Static Values: ${payload.maxstaticvalues}`);
  });

   reset.addEventListener("click", () => {
    detectionChart.resetZoom();
  });


// ================= CHART TYPE SWITCHERS =================
  motionChartTypeSelect.addEventListener("change", (e) => {
    const newType = e.target.value;
    motionChart.config.type = newType;
    
    // Update dataset types for line/bar
    motionChart.data.datasets[0].type = newType;
    motionChart.data.datasets[1].type = newType;
    // Keep scatter as scatter
    motionChart.data.datasets[2].type = "scatter";
    
    motionChart.update();
  //  console.log("✅ Motion chart type changed to:", newType);
  });

  staticChartTypeSelect.addEventListener("change", (e) => {
    const newType = e.target.value;
    staticChart.config.type = newType;
    
    // Update dataset types for line/bar
    staticChart.data.datasets[0].type = newType;
    staticChart.data.datasets[1].type = newType;
    // Keep scatter as scatter
    staticChart.data.datasets[2].type = "scatter";
    
    staticChart.update();
   // console.log("✅ Static chart type changed to:", newType);
  });


  switchmode.addEventListener("click", () => {
    socket.emit("toggleEngineeringMode");
    console.log("🔄 Toggling Engineering Mode");
  });


  resetmaxmotion.addEventListener("click",()=>{
    socket.emit("resetmaxvaluemotion");

  });

  resetmaxstatic.addEventListener("click",()=>{
    socket.emit("resetmaxvaluestatic");
  })


  setSensitivity.addEventListener("click",()=>{
            const data = {
              gate : selectgatetype.value,
              number : selectgatenumber.value,
              value : selectgatevalue.value
            }
            console.log(data);
        socket.emit("setsensitivity",data);

          });
  // startconfig.addEventListener("click",()=>{
  //   socket.emit("task : control",{ action : "start"});
  //   console.log("▶ Starting Configuration Mode");
  // });

  // stopconfig.addEventListener("click",()=>{
  //   socket.emit("task : control",{ action : "stop"});
  //   console.log("⏸ Stopping Configuration Mode");
  // });
 // ================= CONFIG / THRESHOLD DATA =================
  socket.on("configurationData", (config) => {
  //  console.log("⚙ Configuration Received:", config);
  //  console.log("⚙ Motion :", config.motionDistanceGate);
  //  console.log("⚙ Static Sensitivity:", config.staticSensitivity);

    // ✅ use only active gates (first 8)
    const motionThresholds = config.motionSensitivity.slice(0, 8).map(sanitizeVal);
    const staticThresholds = config.staticSensitivity.slice(0, 8).map(sanitizeVal);

    // ✅ dataset[1] = THRESHOLD
    motionChart.data.datasets[1].data = motionThresholds;
    staticChart.data.datasets[1].data = staticThresholds;

    motionChart.update();
    staticChart.update();

    document.getElementById("maxDistance").innerHTML = `${config.maxDistanceGateN}`;
    document.getElementById("motionDistance").innerHTML = `${config.motionDistanceGate}`;
    document.getElementById("stationaryDistance").innerHTML = `${config.staticDistanceGate}`;
    document.getElementById("unmannedDuration").innerHTML = `${config.unmannedDuration} sec`;
  });


  socket.on("dataArray",(dataArray)=>{
    console.log("Received dataArray:", dataArray);
  })

});
