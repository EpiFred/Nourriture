/**
 * Created by PierreYves on 28/11/2014.
 */

var config = {
    development: {
        "mode": 'dev',
        "port": 3000,
        "dbPort": 26017
    },
    production: {
        "mode": 'prod',
        "port": 5000,
        "dbPort": 27017
    }
};

var current;

exports.development = config.development;

exports.production = config.production;

exports.load = function(mode){
    current = config[mode || process.argv[2] || process.env.NODE_ENV] || config.production;
    current.port = process.argv[3] || process.env.PORT || current.port;
    return (current);
};

exports.getCurrent = function(){
    return (current);
};