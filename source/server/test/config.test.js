/**
 * Created by PierreYves on 29/11/2014.
 */

var assert = require("assert");
var config = require("../config");

describe("Configuration module", function(){
    it("should load the development configuration", function(){
        var devConfig = config.load('development');
        assert.equal(devConfig, config.development, "The configuration mode isn't equal to development");
    });

    it("should load the production configuration", function(){
        var prodConfig = config.load('production');
        assert.equal(prodConfig, config.production, "The configuration mode isn't equal to production");
    });
});