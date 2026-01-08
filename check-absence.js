import { stat } from "fs";
import { occupancy } from "./occupancy.js";
import { createOccupancyDetector } from "./occupancy-detector.js";


 
 export function createPayloadBuffer(getMotionThreshold,
  getStaticThreshold) {
  let buffer = [];

  const processOccupancy = createOccupancyDetector({
  absenceDelayMs: 3000
});



  setInterval(() => {
    if (buffer.length === 0) return;

    const GATE_COUNT = 9;

    let m_sum = Array(GATE_COUNT).fill(0);
    let s_sum = Array(GATE_COUNT).fill(0);

    buffer.forEach(payload => {
      payload.MotionGateValues.forEach((val, gateIndex) => {
        m_sum[gateIndex] += val;
      });

      payload.StaticGateValues.forEach((val, gateIndex) => {
        s_sum[gateIndex] += val;
      });
    });

    // Integer-precise averages
    let m_avg = m_sum.map(sum => Math.round(sum / buffer.length));
    let s_avg = s_sum.map(sum => Math.round(sum / buffer.length));


   //console.log("Motion Avg:", m_avg);
   //console.log("Static Avg:", s_avg);
    const motion_thres = getMotionThreshold();
    const static_thres = getStaticThreshold();

     // ✅ STATEFUL OCCUPANCY CHECK
    const occupied = processOccupancy({
      m_avg,
      s_avg,
      motion_thres,
      static_thres
    });

    console.log("OCCUPIED:", occupied);

   
    

    
   // console.log(occupancy(m_avg,s_avg,motion_thres,static_thres));
     
    buffer.length = 0;
  }, 1000);

  return function onData(payload) {
    buffer.push(payload);
  };
}
