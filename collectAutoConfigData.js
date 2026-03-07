export default function CollectAutoConfigData(dataArray , MotionSensitivity , StaticSensitivity) {
  const motionMax = [];
  const staticMax = [];

  //console.log(dataArray);


  dataArray.forEach(item => {
    const motion = item.maxmotionvalues || [];
    const stat = item.maxstaticvalues || [];
      console.log("Value for Motion",motion);
      console.log("Value for Static",stat);
    motion.forEach((val, i) => {
      
      if (!Number.isNaN(val)) {
        motionMax[i] = motionMax[i] === undefined
          ? val
          : Math.max(motionMax[i], val);
      }
    });

    stat.forEach((val, i) => {
      if (!Number.isNaN(val)) {
        staticMax[i] = staticMax[i] === undefined
          ? val
          : Math.max(staticMax[i], val);
      }
    });
  });

  return {
    motionMax,
    staticMax,
    MotionSensitivity,
    StaticSensitivity
  };

}


