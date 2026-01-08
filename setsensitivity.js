import {sensitivity_configuration} from "./sensitivity-configuration.js";


const setSensitivity = (data) =>{
    const { newsensitivity_data, MotionSensitivity , StaticSensitivity} = data;

      let MotionSensitivity_config = [0,0,0,0,0,0,0,0];
      let StaticSensitivity_config = [0,0,0,0,0,0,0,0];
     console.log(newsensitivity_data) ;
 //   console.log( MotionSensitivity);
  //  console.log(StaticSensitivity);

    newsensitivity_data.motion.forEach((v,i) => {
       if(typeof(v === "number")){

        MotionSensitivity_config[i] = v;
       }

    });

    
    newsensitivity_data.static.forEach((v,i) => {
       if(typeof(v === "number")){

        StaticSensitivity_config[i] = v;
       }
    });

   let configured_motion_sensitivity = MotionSensitivity_config;
   let configured_static_sensitivity = StaticSensitivity_config;
  
   sensitivity_configuration({configured_motion_sensitivity,configured_static_sensitivity,MotionSensitivity,StaticSensitivity});


  // console.log(configured_motion_sensitivity);
   //console.log(configured_static_sensitivity);
};

export default setSensitivity;