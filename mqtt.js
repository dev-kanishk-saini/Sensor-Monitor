import dotenv from 'dotenv';
import mqtt from 'mqtt';
dotenv.config();



    const brokerUrl = process.env.MQTT_BROKER_URL;
const options = {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
};
    
       const client = mqtt.connect(brokerUrl, options);
        client.on('connect', () => {
            console.log('Connected to MQTT broker');
        });
        client.on('error', (error) => {
            console.error('MQTT connection error:', error);
        });
        client.on('close', () => {
            console.log('MQTT connection closed');
        });
        export default client;
    

   
