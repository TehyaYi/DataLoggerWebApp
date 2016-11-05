/**
 * Main application file
 */

'use strict';

import express from 'express';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import config from './config/environment';
import http from 'http';

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1); // eslint-disable-line no-process-exit
});

// Populate databases with sample data
if(config.seedDB) {
  require('./config/seed');
}

// Setup server
var app = express();
var server = http.createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: config.env !== 'production',
  path: '/socket.io-client'
});
var Serial = require('./serial/serial.js');
var Parser = require('./serial/parser.js');
var dbStream = require('./db/dbStream.js');
var arduinoListener = new Serial();
var parser = new Parser();
var database = new dbStream();
parser.on('data',function(data){
    switch(data.CAN_Id){
      case 1574:
      case 512:
      case 513:
        socketio.emit("car",data);
        break;
      case 1160:
      case 392:
      case 904:
        socketio.emit("bms",data);
        break;
    }
});
arduinoListener.pipe(parser).pipe(database);
require('./config/socketio').default(socketio);
require('./config/express').default(app);
require('./routes').default(app,parser,database);
// Start server
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });
}

setImmediate(startServer);

// Expose app
exports = module.exports = app;