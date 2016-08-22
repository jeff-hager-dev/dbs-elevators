var winston = require('winston');

winston.setLevels({debug:0,info: 1,silly:2,warn: 3,error:4,});
winston.addColors({debug: 'green',info:  'cyan',silly: 'magenta',warn:  'yellow',error: 'red'});
winston.level = 'error';
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {colorize: true});
winston.add(winston.transports.File, {filename: 'app.log'});

module.exports = winston;