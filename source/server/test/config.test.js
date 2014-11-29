/**
 * Created by PierreYves on 29/11/2014.
 */

var assert = require("assert");

describe("Configuration module", function(){
    it("should load the development configuration", function(){
        var config = require("../config")("development");
        assert.equal(config.mode, config.development, "The configuration mode isn't equal to development");
    });

    it("should load the production configuration", function(){
        var config = require("../config")("production");
        assert.equal(config.mode, config.production, "The configuration mode isn't equal to production");
    });
});