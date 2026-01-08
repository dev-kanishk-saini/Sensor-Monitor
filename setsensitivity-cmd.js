import { execute_commands } from "./sensitivity-configuration.js";
import { hexStringToBuffer, port } from "./index.js";
import {CONFIG_CMD_ENB} from "./index.js";
import { CONFIG_CMD_DIS} from "./index.js";

export const splitHexBytes = (n) =>    Number(n).toString(16).toUpperCase().padStart(4, '0').match(/.{2}/g) ;

const  set_sensitivity_cmd = (data_object) => {

    let SENSITIVITY_CMD_STRUCT = ["FD","FC","FB","FA","14","00","64","00","00","00","03","00","00","00","01","00","28","00","00","00","02","00","28","00","00","00","04","03","02","01"];
 
  
  
        
      

        let gate = data_object.data.number;
        let motion_value = data_object.data.motiongatevalue;
        let static_value = data_object.data.staticgatevalue;



          const gate_hex = splitHexBytes(gate);
          const motion_value_hex = splitHexBytes(motion_value);
          const static_value_hex = splitHexBytes(static_value);

          console.log(gate_hex);
          console.log(motion_value_hex);
          console.log(static_value_hex);

            SENSITIVITY_CMD_STRUCT[10] = gate_hex[1];
  SENSITIVITY_CMD_STRUCT[11] = gate_hex[0];

  SENSITIVITY_CMD_STRUCT[16] = motion_value_hex[1];
  SENSITIVITY_CMD_STRUCT[17] = motion_value_hex[0];

  SENSITIVITY_CMD_STRUCT[22] = static_value_hex[1];
  SENSITIVITY_CMD_STRUCT[23] = static_value_hex[0];

    //   let Cmd_array = [];
       const command = hexStringToBuffer(SENSITIVITY_CMD_STRUCT.join(" "));
 // Cmd_array.push(command);
      //execute_commands(Cmd_array);
            if (port.isOpen) {
                port.write(CONFIG_CMD_ENB, () => {
                console.log(
                  "📤 Sent (Config Mode ON):",
                  CONFIG_CMD_ENB.toString("hex").toUpperCase()
                );
              });
         
               port.write(command, () => {
                console.log(
                   `Set the sensitivity of the gate ${gate} at motion : ${motion_value} and static : ${static_value}`
                );
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
};

export default set_sensitivity_cmd;

