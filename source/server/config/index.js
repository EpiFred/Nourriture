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

module.exports = function (mode){
    return (config[mode || process.argv[2] || process.env.NODE_ENV] || config.production);
};