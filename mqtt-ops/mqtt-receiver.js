var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://192.168.43.135')
console.log("HELLO");

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
//  client.end()
})