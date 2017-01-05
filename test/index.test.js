"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var mocha_typescript_1 = require("mocha-typescript");
var ServerlecsPlugin = require("../index");
var _ = require("lodash");
var app = {
    name: 'Container',
    load_balancer: {
        subnets: 'blah-vtha'
    }
};
var otherApp = {
    name: 'Container',
    load_balancer: {
        subnets: 'blah-vtha'
    }
};
var containerless = {
    name: 'Blah',
    repository: 'blah/vtha',
    clusterId: 'arn:blah:vtha',
    load_balancer: {
        vpcId: 'vpc-123456'
    },
    applications: [app, otherApp]
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
    return ServerlecsPluginTest;
}());
ServerlecsPluginTest = __decorate([
    mocha_typescript_1.suite
], ServerlecsPluginTest);
