var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://127.0.0.1')
const logModel = require('./dht_logs.model');
var redis = require('redis');
var redis_client = redis.createClient();

redis_client.on('connect', function() {
  console.log('Redis client connected');
});

redis_client.on('error', function(err){
  console.log('redis Something went wrong ', err)
});



var payload={'temperature': 40+" °C", 'humidity': 20+" °H", 'device_id': '34:df:rf', 'time':  new Date().toLocaleString()};
let interval;
global.io.on("connection", socket => {
  console.log("New client connected");
  
  if (interval) {
    clearInterval(interval);
  }
  global.socket = socket;
  getApiAndEmit(global.socket);
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
    
    tempStruct.time = new Date().toLocaleString();
    //console.log("tempStruct",JSON.stringify(tempStruct));
    redis_client.set('last_gotten_data', JSON.stringify(tempStruct), redis.print);
    //console.log(tempStruct.toString());
    //  payload = { "temperature":  tempStruct.temperature,
    //         "humidity": tempStruct.humidity, "device_id": tempStruct.device_id, 'time':  new Date().toLocaleString()};

               getApiAndEmit(global.socket);
               

})

async function getDataFromRedis(){
  return new Promise( (resolve, reject)=> {
  redis_client.get('last_gotten_data', function(error, result) {
    if (error) throw error;
  
   let okay =  JSON.parse(result)
  resolve(okay);
  });
});
}

async function getlastSavedTimeFromRedis(){
  return new Promise( (resolve, reject)=> {
  redis_client.get('last_saved_time', function(error, result) {
    if (error) throw error;
  resolve(result);
  });
});
}

const getApiAndEmit = async socket => {
  try {
   // let socket = socket;
   var tempStruct = await getDataFromRedis();

    payload = { "temperature":  tempStruct.temperature,
           "humidity": tempStruct.humidity, "device_id": tempStruct.device_id, 'time': tempStruct.time};
                console.log("payload", payload);
               if(socket!= undefined)
               socket.emit("FromAPI", payload); 

               let last_saved_time = await getlastSavedTimeFromRedis();
               if(last_saved_time != undefined){
               var datetime = new Date( last_saved_time ).getTime();
               var now = new Date().getTime();
               var diff = now - datetime; 
              
               if(diff >  (600 * 1000 ) ){
                console.log("diff", diff);
              logModel.addLog(payload);
              redis_client.set('last_saved_time', new Date().toLocaleString());
             }
               }
               else{
                redis_client.set('last_saved_time', new Date().toLocaleString());
               }
   
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};
//setInterval(getApiAndEmit, 3000);

