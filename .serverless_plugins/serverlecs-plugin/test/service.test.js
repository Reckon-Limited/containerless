"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var mocha_typescript_1 = require("mocha-typescript");
var chai_1 = require("chai");
var service_1 = require("../service");
var _ = require("lodash");
var opts = {
    name: 'Blah',
    repository: 'blah/vtha',
    clusterId: 'arn:blah:vtha',
    port: 3000,
    path: '/blah/vtha/',
    load_balancer: {
        vpcId: 'vpc-123456',
        security_group: 'sg-123456',
        subnets: ['subnet-123456']
    }
};
var ServiceTest = (function () {
    function ServiceTest() {
    }
    ServiceTest.prototype.before = function () {
        var service = new service_1.Service(opts);
        this.resources = service.generateResources();
        console.log(this.resources);
    };
    ServiceTest.prototype.assert_service_resource = function () {
        var result = _.get(this.resources, 'blah.Type');
        chai_1.expect(result).to.eq('AWS::ECS::Service');
        result = _.get(this.resources, 'blah.Properties.Cluster');
        chai_1.expect(result).to.eq(opts.clusterId);
    };
    ServiceTest.prototype.assert_container_resource = function () {
        var result = _.get(this.resources, 'blahTaskDefinition.Type');
        chai_1.expect(result).to.eq('AWS::ECS::TaskDefinition');
        result = _.get(this.resources, 'blahTaskDefinition.Properties.ContainerDefinitions[0].Name');
        chai_1.expect(result).to.eq('blah');
    };
    return ServiceTest;
}());
__decorate([
    mocha_typescript_1.test('Service Resource')
], ServiceTest.prototype, "assert_service_resource", null);
__decorate([
    mocha_typescript_1.test('Container Resource')
], ServiceTest.prototype, "assert_container_resource", null);
ServiceTest = __decorate([
    mocha_typescript_1.suite
], ServiceTest);
