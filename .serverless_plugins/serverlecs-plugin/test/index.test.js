"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var mocha_typescript_1 = require("mocha-typescript");
var chai_1 = require("chai");
var ServerlecsPlugin = require("../index");
var _ = require("lodash");
var containerless = {
    name: 'Blah',
    repository: 'blah/vtha',
    clusterId: 'arn:blah:vtha',
    load_balancer: {
        vpcId: 'vpc-123456'
    },
    applications: [
        { name: 'Container' }
    ]
};
var ServerlecsPluginTest = (function () {
    function ServerlecsPluginTest() {
    }
    ServerlecsPluginTest.prototype.before = function () {
        var serverless = {};
        _.set(serverless, 'service.custom.containerless', containerless);
        _.set(serverless, 'processedInput.options.tag', 'tag');
        _.set(serverless, 'config.servicePath', '/blah/vtha');
        _.set(serverless, 'cli.log', function () { });
        this.plugin = new ServerlecsPlugin(serverless, {});
    };
    ServerlecsPluginTest.prototype.assert_flattens_config = function () {
        var result = this.plugin.prepare();
        chai_1.expect(result).to.be.an('array');
        chai_1.expect(result[0]).to.have.property('name');
        chai_1.expect(result[0]).to.have.property('load_balancer');
        chai_1.expect(result[0]).to.have.property('path');
        chai_1.expect(result[0]).to.have.property('image');
    };
    return ServerlecsPluginTest;
}());
__decorate([
    mocha_typescript_1.test('Flattens configuration')
], ServerlecsPluginTest.prototype, "assert_flattens_config", null);
ServerlecsPluginTest = __decorate([
    mocha_typescript_1.suite
], ServerlecsPluginTest);
