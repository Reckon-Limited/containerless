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
    ServerlecsPluginTest.prototype.assert_service_defaults = function () {
        chai_1.expect(this.plugin.service).to.have.property('log_retention');
        chai_1.expect(this.plugin.service.log_retention).to.eq(7);
    };
    ServerlecsPluginTest.prototype.assert_flattens_config = function () {
        var result = this.plugin.prepare();
        chai_1.expect(result).to.be.an('array');
        chai_1.expect(result[0]).to.have.property('name');
        chai_1.expect(result[0]).to.have.property('load_balancer');
        chai_1.expect(result[0]).to.have.property('path');
        chai_1.expect(result[0]).to.have.property('image');
    };
    ServerlecsPluginTest.prototype.assert_app_config = function () {
        var result = this.plugin.prepareApplication('app', app);
        chai_1.expect(result.name).to.eq('app');
        chai_1.expect(result.load_balancer.vpcId).to.eq(containerless.load_balancer.vpcId);
        chai_1.expect(result.load_balancer.subnets).to.eq(app.load_balancer.subnets);
    };
    ServerlecsPluginTest.prototype.assert_app_priority = function () {
        var result = this.plugin.prepare();
        _.each(result, function (app, idx) {
            chai_1.expect(app.priority).to.eq(idx + 1);
        });
    };
    return ServerlecsPluginTest;
}());
__decorate([
    mocha_typescript_1.test('Sets service default ')
], ServerlecsPluginTest.prototype, "assert_service_defaults", null);
__decorate([
    mocha_typescript_1.test('Flattens configuration')
], ServerlecsPluginTest.prototype, "assert_flattens_config", null);
__decorate([
    mocha_typescript_1.test('Prepares app configuration')
], ServerlecsPluginTest.prototype, "assert_app_config", null);
__decorate([
    mocha_typescript_1.test('Sets app priority')
], ServerlecsPluginTest.prototype, "assert_app_priority", null);
ServerlecsPluginTest = __decorate([
    mocha_typescript_1.suite
], ServerlecsPluginTest);
