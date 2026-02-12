import { hexStringToBuffer, port } from "./index.js";
import {CONFIG_CMD_ENB} from "./index.js";
import { CONFIG_CMD_DIS} from "./index.js";

export const splitHexBytes = (n) =>   n.toString(16).toUpperCase().padStart(4, '0').match(/.{2}/g) ;

export const execute_commands = (commandArray) => {
       if (port.isOpen) {
      port.write(CONFIG_CMD_ENB, () => {
      console.log(
        "📤 Sent (Config Mode ON):",
        CONFIG_CMD_ENB.toString("hex").toUpperCase()
      );
    });

   commandArray.forEach((element,index) => {
        const  CMD = hexStringToBuffer(element);
             port.write(CMD, () => {
      console.log(`Set the Sensitivity of the gate ${index}.`);
    });
   });

    port.write(CONFIG_CMD_DIS, () => {
      console.log(
        "📤 Sent (Config Mode OFF):",
        CONFIG_CMD_DIS.toString("hex").toUpperCase()
      );
    });

    

    } else {
      console.warn("⚠ Serial port not open. Command not sent. Failed to SET the Sensitivity");
    }
}

export const sensitivity_configuration = (data) => {
    const motion_sensitivity = data.configured_motion_sensitivity;
    const static_sensitivity = data.configured_static_sensitivity;
    const MotionSensitivity = data.MotionSensitivity;
    const StaticSensitivity = data.StaticSensitivity;
    let commandArray = [];
    let SENSITIVITY_CMD_STRUCT = ["FD","FC","FB","FA","14","00","64","00","00","00","03","00","00","00","01","00","28","00","00","00","02","00","28","00","00","00","04","03","02","01"];
 
      
      
       





//   for(let i = 0; i < 8 ; i++){
        
//             gate = i;

//         if(motion_sensitivity[i] !== NaN){
//                motion_value = motion_sensitivity[i];
//         }else{
//             motion_value = MotionSensitivity[i];
//         }
       
      
//         if(static_sensitivity[i] !== NaN){
//                static_value = static_sensitivity[i];
//         }else{
//             static_value = StaticSensitivity[i];
//         }

//     const  gate_hex = gate.toString(16).toUpperCase()
//   .padStart(4, '0');
//     const  motion_value_hex = motion_value.toString(16).toUpperCase()
//   .padStart(4, '0');
//     const  static_value_hex = static_value.toString(16).toUpperCase()
//   .padStart(4, '0');

//     console.log(gate_hex);
//     console.log(motion_value_hex);
//     console.log(static_value_hex);
         let gate ;
        let motion_value;
        let static_value;
for (let i = 0; i < 8; i++) {

   gate = i;

   motion_value = !Number.isNaN(motion_sensitivity[i])
    ? motion_sensitivity[i]
    : MotionSensitivity[i];

   static_value = !Number.isNaN(static_sensitivity[i])
    ? static_sensitivity[i]
    : StaticSensitivity[i];

  const gate_hex = splitHexBytes(gate);
  const motion_value_hex = splitHexBytes(motion_value);
  const static_value_hex = splitHexBytes(static_value);
  

//   console.log("gate =", gate_hex);
//   console.log("motion =", motion_value_hex);
//   console.log("static =", static_value_hex);


  SENSITIVITY_CMD_STRUCT[10] = gate_hex[1];
  SENSITIVITY_CMD_STRUCT[11] = gate_hex[0];

  SENSITIVITY_CMD_STRUCT[16] = motion_value_hex[1];
  SENSITIVITY_CMD_STRUCT[17] = motion_value_hex[0];

  SENSITIVITY_CMD_STRUCT[22] = static_value_hex[1];
  SENSITIVITY_CMD_STRUCT[23] = static_value_hex[0];

  const command = SENSITIVITY_CMD_STRUCT.join(" ");
  commandArray.push(command);
  
}



    execute_commands(commandArray);
    
};

