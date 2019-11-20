var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://192.168.43.135')
const logModel = require('./dht_logs.model');
client.on('connect', function () {
  client.subscribe('topic/sensor_data', function (err) {
    if (!err) {
    }else{
        console.log(err)
    }
    
  })
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  //console.log(message.toString())
    var tempStruct = JSON.parse(message.toString())
    console.log(tempStruct);
    var payload = { "temperature":  tempStruct.temperature,
            "humidity": tempStruct.humidity, "device_id": tempStruct.device_id};
    logModel.addLog(payload);
//  client.end()
})