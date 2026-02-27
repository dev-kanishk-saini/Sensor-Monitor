import client from "./mqtt.js";



let lastOccupied = null;

export function handleOccupiedChange(occupied) {

    if (lastOccupied === occupied) return;

    lastOccupied = occupied;

    const command = occupied
        ? '#*2*29*2*1*#'
        : '#*2*29*2*0*#';

    if (client.connected) {
        client.publish('swaja/office/in', command, { qos: 1 }, (err) => {
            if (err) {
                console.error("MQTT publish error:", err);
            } else {
                console.log("Published:", command);
            }
        });
    }
}
