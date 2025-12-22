if (!window.socket) {
  window.socket = io();
}
const socket = window.socket;

window.addEventListener("DOMContentLoaded",()=>{
    console.log("New Script Loaded.");

   const startconfig = document.getElementById("startconfig");
   const stopconfig = document.getElementById("stopconfig");
   const motionChartTypeSelect = document.getElementById("configuremotionChartType");
   const staticChartTypeSelect = document.getElementById("configurestaticChartType");
   const mg1 = document.getElementById("motiongate1");
   const mg2 = document.getElementById("motiongate2");
   const mg3 = document.getElementById("motiongate3");
   const mg4 = document.getElementById("motiongate4");
   const mg5 = document.getElementById("motiongate5");
   const mg6 = document.getElementById("motiongate6");
   const mg7 = document.getElementById("motiongate7");
   const mg8 = document.getElementById("motiongate8");


   const sg1 = document.getElementById("staticgate1");
   const sg2 = document.getElementById("staticgate2");
   const sg3 = document.getElementById("staticgate3");
   const sg4 = document.getElementById("staticgate4");
   const sg5 = document.getElementById("staticgate5");
   const sg6 = document.getElementById("staticgate6");
   const sg7 = document.getElementById("staticgate7");
   const sg8 = document.getElementById("staticgate8");


    const mgp1 = document.getElementById("mpeakvalue1");
   const mgp2 = document.getElementById("mpeakvalue2");
   const mgp3 = document.getElementById("mpeakvalue3");
   const mgp4 = document.getElementById("mpeakvalue4");
   const mgp5 = document.getElementById("mpeakvalue5");
   const mgp6 = document.getElementById("mpeakvalue6");
   const mgp7 = document.getElementById("mpeakvalue7");
   const mgp8 = document.getElementById("mpeakvalue8");


   const sgp1 = document.getElementById("speakvalue1");
   const sgp2 = document.getElementById("speakvalue2");
   const sgp3 = document.getElementById("speakvalue3");
   const sgp4 = document.getElementById("speakvalue4");
   const sgp5 = document.getElementById("speakvalue5");
   const sgp6 = document.getElementById("speakvalue6");
   const sgp7 = document.getElementById("speakvalue7");
   const sgp8 = document.getElementById("speakvalue8");




   let Distances = [];

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
  const motionCanvas = document.getElementById("configuremotionChart");
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


   const staticCanvas = document.getElementById("configurestaticChart");
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
  const detectionCanvas = document.getElementById("configuredetectionChart");
  if (!detectionCanvas) {
    console.error("❌ detectionChart canvas not found in DOM");
    return;
  }


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


  socket.on("configurationData", (config) => {


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



   socket.on("configuredataset",(data)=>{
    console.log(data);
    mg1.value = `${data.motiongatecount[0]}`;
    mg2.value = `${data.motiongatecount[1]}`;
    mg3.value = `${data.motiongatecount[2]}`;
    mg4.value = `${data.motiongatecount[3]}`;
    mg5.value = `${data.motiongatecount[4]}`;
    mg6.value = `${data.motiongatecount[5]}`;
    mg7.value = `${data.motiongatecount[6]}`;
    mg8.value = `${data.motiongatecount[7]}`;

    sg1.value = `${data.staticgatecount[0]}`;
    sg2.value = `${data.staticgatecount[1]}`;
    sg3.value = `${data.staticgatecount[2]}`;
    sg4.value = `${data.staticgatecount[3]}`;
    sg5.value = `${data.staticgatecount[4]}`;
    sg6.value = `${data.staticgatecount[5]}`;
    sg7.value = `${data.staticgatecount[6]}`;
    sg8.value = `${data.staticgatecount[7]}`;

    mgp1.value = `${data.dataArray[data.dataArray.length - 1].data.maxmotionvalues[0]}`;
    mgp2.value = `${data.dataArray[data.dataArray.length - 1].data.maxmotionvalues[1]}`;
    mgp3.value = `${data.dataArray[data.dataArray.length - 1].data.maxmotionvalues[2]}`;
    mgp4.value = `${data.dataArray[data.dataArray.length - 1].data.maxmotionvalues[3]}`;
    mgp5.value = `${data.dataArray[data.dataArray.length - 1].data.maxmotionvalues[4]}`;
    mgp6.value = `${data.dataArray[data.dataArray.length - 1].data.maxmotionvalues[5]}`;
    mgp7.value = `${data.dataArray[data.dataArray.length - 1].data.maxmotionvalues[6]}`;
    mgp8.value = `${data.dataArray[data.dataArray.length - 1].data.maxmotionvalues[7]}`;

    sgp1.value = `${data.dataArray[data.dataArray.length - 1].data.maxstaticvalues[0]}`;
    sgp2.value = `${data.dataArray[data.dataArray.length - 1].data.maxstaticvalues[1]}`;
    sgp3.value = `${data.dataArray[data.dataArray.length - 1].data.maxstaticvalues[2]}`;
    sgp4.value = `${data.dataArray[data.dataArray.length - 1].data.maxstaticvalues[3]}`;
    sgp5.value = `${data.dataArray[data.dataArray.length - 1].data.maxstaticvalues[4]}`;
    sgp6.value = `${data.dataArray[data.dataArray.length - 1].data.maxstaticvalues[5]}`;
    sgp7.value = `${data.dataArray[data.dataArray.length - 1].data.maxstaticvalues[6]}`;
    sgp8.value = `${data.dataArray[data.dataArray.length - 1].data.maxstaticvalues[7]}`;


   


   });
   

      startconfig.addEventListener("click",()=>{
    socket.emit("task : control",{ action : "start"});
    console.log("▶ Starting Configuration Mode");
  });

  stopconfig.addEventListener("click",()=>{
    socket.emit("task : control",{ action : "stop"});
    console.log("⏸ Stopping Configuration Mode");
  });
})