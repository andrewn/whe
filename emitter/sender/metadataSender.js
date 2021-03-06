var faye = require('faye')
    path = require('path'),
    http = require('http'),
    fs = require('fs'),
    request = require('request');

var configPath = path.join(__dirname, '..', '..', 'shared', 'config.json'),
    config = require(configPath),
    client = new faye.Client( fayeUrl(config.collector) );

client.subscribe('/trigger', handleTrigger);

// Send a heartbeat every few secs (defined in config)
setInterval(heartbeat, config.heartbeatIntervalSecs * 1000);

// Tell everyone we're here
function heartbeat() {
  client.publish('/heartbeat', { id: '1', type: 'emitter' });
}

function fayeUrl(url) {
  return 'http://' + url.host + ':' + url.port + '/faye';
}

function handleTrigger() {
  var dataFilename = '../data.json';
  console.log('Trigger message received');
   try {
      console.log('faye: got message', typeof msg,  msg);
      console.log(msg.trigger);
      // load file from the expected place if it's not too old
      console.log('looking for creation time of '+path.join(__dirname, dataFilename));
      fs.stat(path.join(__dirname, dataFilename), fsDateCallback);
   } catch(e) {
      console.log("problem");
      console.error(e.stack);
   }
}

function fsDateCallback(err, data){
   var threshold = 1000*1000; //diff is in milliseconds, so this gives threshold in secs - should be in config?
   if(err){
      console.log("error: assuming no file, not sending metadata");
   }else{
     console.log("fs date callback ok so far");
     console.log(data.ctime);
     var startDate = data.ctime.getTime();
     var endDate = Date.now();
     var diff = endDate - startDate;
     console.log('startDate '+startDate+' endDate '+endDate+' diff '+diff/1000+' threshold '+threshold+' secs');
     if(diff < threshold){
       console.log('metadata data age is ok, sending');
       fs.readFile(path.join(__dirname, dataFilename), 'utf8', function (err,fdata) {
         if (err) {
           return console.log(err);
         }
         sendData(fdata);
       });
     }else{
       console.log("metadata is too old - not sending");
     }
   }
}

function sendData(fdata){
   console.log("sending metadata "+fdata);
   var headers = {
    'Content-Type': 'application/json',
    'Content-Length': fdata.length
   };

   var options = {
     host: config.collector.host,
     port: config.collector.port,
     path: '/metadata',
     method: 'POST',
     headers: headers
   };

   var req = http.request(options, requestCallback);
   req.write(fdata);
   req.end();
}
