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
    cluster: 'arn:blah:vtha',
    containers: [
        { name: 'Container' }
    ]
};
// @suite
var ServiceTest = (function () {
    function ServiceTest() {
    }
    ServiceTest.prototype.before = function () {
        var service = new service_1.Service(opts);
        this.resources = service.generateResources();
    };
    ServiceTest.prototype.assert_service_resource = function () {
        var result = _.get(this.resources, 'Blah.Type');
        chai_1.expect(result).to.eq('AWS::ECS::Service');
        result = _.get(this.resources, 'Blah.Properties.Cluster');
        chai_1.expect(result).to.eq(opts.cluster);
    };
    ServiceTest.prototype.assert_container_resource = function () {
        var result = _.get(this.resources, 'BlahTaskDefinition.Type');
        chai_1.expect(result).to.eq('AWS::ECS::TaskDefinition');
        result = _.get(this.resources, 'BlahTaskDefinition.Properties.ContainerDefinitions[0].Name');
        chai_1.expect(result).to.eq('Container');
    };
    return ServiceTest;
}());
__decorate([
    mocha_typescript_1.test('Service Resource')
], ServiceTest.prototype, "assert_service_resource", null);
__decorate([
    mocha_typescript_1.test('Container Resource')
], ServiceTest.prototype, "assert_container_resource", null);
