const  autoconfig = (DataArray,MotionSensitivity,StaticSensitivity) =>{
  //  console.log(DataArray);
      let motion_sum = [0,0,0,0,0,0,0,0];
      let motion_total = [0,0,0,0,0,0,0,0];
   
      let static_sum = [0,0,0,0,0,0,0,0];
      let static_total = [0,0,0,0,0,0,0,0];

    DataArray.forEach(element => {
        const motionarray =  element.data.MotionGateValues;
        motionarray.forEach((v,i) =>{
            if(v > MotionSensitivity[i]){
                motion_sum[i] = motion_sum[i] + v;
                motion_total[i] = motion_total[i] + 1;
            }
        });

        const staticarray =  element.data.StaticGateValues;
        staticarray.forEach((v,i) =>{
            if(v > StaticSensitivity[i]){
                static_sum[i] = static_sum[i] + v;
                static_total[i] = static_total[i] + 1;
            }
        });
       
    });

    let newMotionSensitivity = [0,0,0,0,0,0,0,0];
    let newStaticSensitivity = [0,0,0,0,0,0,0,0];

    motion_sum.forEach((v,i) =>{
       const value  = (v/motion_total[i]);
       newMotionSensitivity[i] = parseInt(value);
    });

     static_sum.forEach((v,i) =>{
       const value  = (v/static_total[i]);
       newStaticSensitivity[i] = parseInt(value);
    });
     
      const sensitivityData =  {  motion : newMotionSensitivity , 
                                  static : newStaticSensitivity}
    return sensitivityData;
   /// console.log(newMotionSensitivity,newStaticSensitivity);
}

export default autoconfig;