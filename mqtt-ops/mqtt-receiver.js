var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://192.168.43.135')
const logModel = require('./dht_logs.model');


var payload={'temperature': 40+" °C", 'humidity': 20+" °H", 'device_id': '34:df:rf', 'time':  new Date().toLocaleString()};
let interval;
global.io.on("connection", socket => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  global.socket = socket;
  //interval = setInterval(() => getApiAndEmit(socket), 5000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});


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
     payload = { "temperature":  tempStruct.temperature,
            "humidity": tempStruct.humidity, "device_id": tempStruct.device_id, 'time':  new Date().toLocaleString()};
              getApiAndEmit(global.socket);
            logModel.addLog(payload);
//  client.end()
})

const getApiAndEmit = async socket => {
  try {
    console.log("payload", payload);
    socket.emit("FromAPI", payload); // Emitting a new message. It will be consumed by the client
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};
//setInterval(getApiAndEmit, 3000);

