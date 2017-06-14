"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mocha_typescript_1 = require("mocha-typescript");
var chai_1 = require("chai");
var cluster_1 = require("../cluster");
var service_1 = require("../service");
var _ = require("lodash");
describe('with an existing cluster and a load balanced container', function () {
    var ServiceTest = (function () {
        function ServiceTest() {
            this.cluster = {
                id: 'arn:aws:ecs:ap-southeast-2:005213230316:cluster/vtha-ECSCluster-1A5ZYNUN7X46N',
                security_group: 'sg-abcdef',
                vpcId: 'vpc-1',
                subnets: [
                    'subnet-12359e64',
                    'subnet-b442c0d0',
                    'subnet-a2b967fb'
                ]
            };
            this.opts = {
                service: 'blah-vtha-dev',
                name: 'app-1',
                repository: 'blah/vtha',
                tag: 'tag-1',
                url: '/',
                port: 1111,
                environment: [
                    { blah: 'vtha' }
                ]
            };
        }
        ServiceTest.prototype.before = function () {
            var cluster = new cluster_1.Cluster(this.cluster);
            this.service = new service_1.Service(cluster, this.opts);
            this.resources = this.service.generate();
        };
        ServiceTest.prototype.service_name = function () {
            chai_1.expect(this.service.name).to.eql('BlahVthaDevApp1');
        };
        ServiceTest.prototype.service_healthcheckPath = function () {
            chai_1.expect(this.service.healthcheckPath).to.eql('/');
        };
        ServiceTest.prototype.service_resource = function () {
            var result = _.get(this.resources, 'BlahVthaDevApp1.Type');
            chai_1.expect(result).to.eql('AWS::ECS::Service');
        };
        ServiceTest.prototype.task_definition_resource_type = function () {
            var result = _.get(this.resources, 'BlahVthaDevApp1TaskDefinition.Type');
            chai_1.expect(result).to.eql('AWS::ECS::TaskDefinition');
        };
        ServiceTest.prototype.task_definition_resource = function () {
            var result = _.get(this.resources, 'BlahVthaDevApp1TaskDefinition.Properties.ContainerDefinitions[0].Name');
            chai_1.expect(result).to.eql('BlahVthaDevApp1');
        };
        ServiceTest.prototype.environment_variables = function () {
            var result = _.get(this.resources, 'BlahVthaDevApp1TaskDefinition.Properties.ContainerDefinitions[0].Environment');
            chai_1.expect(result).to.eql([{ Name: 'blah', Value: 'vtha' }]);
        };
        ServiceTest.prototype.port_mappings = function () {
            var result = _.get(this.resources, 'BlahVthaDevApp1TaskDefinition.Properties.ContainerDefinitions[0].PortMappings');
            chai_1.expect(result).to.eql([{ 'ContainerPort': 1111 }]);
        };
        ServiceTest.prototype.service_role = function () {
            var result = _.get(this.resources, 'BlahVthaDevApp1.Properties.Role.Ref');
            chai_1.expect(result).to.eql('ClsELBRole');
        };
        ServiceTest.prototype.service_load_balancers = function () {
            var result = _.get(this.resources, 'BlahVthaDevApp1.Properties.LoadBalancers');
            chai_1.expect(result).to.not.be.empty;
        };
        return ServiceTest;
    }());
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "service_name", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "service_healthcheckPath", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "service_resource", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "task_definition_resource_type", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "task_definition_resource", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "environment_variables", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "port_mappings", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "service_role", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "service_load_balancers", null);
    ServiceTest = __decorate([
        mocha_typescript_1.suite
    ], ServiceTest);
});
describe('new cluster and container without load balancer', function () {
    var ServiceTest = (function () {
        function ServiceTest() {
            this.cluster = {
                vpcId: 'vpc-1',
                subnets: [
                    'subnet-12359e64',
                    'subnet-b442c0d0',
                    'subnet-a2b967fb'
                ]
            };
            this.opts = {
                service: 'blah-vtha-dev',
                name: 'app-1',
                repository: 'blah/vtha',
                stage: 'production',
                tag: 'tag-1',
            };
        }
        ServiceTest.prototype.before = function () {
            var cluster = new cluster_1.Cluster(this.cluster);
            this.service = new service_1.Service(cluster, this.opts);
            this.resources = this.service.generate();
        };
        ServiceTest.prototype.service_name_with_stage = function () {
            chai_1.expect(this.service.name).to.eql('BlahVthaDevProductionApp1');
        };
        ServiceTest.prototype.service_load_balancers = function () {
            var result = _.get(this.resources, 'BlahVthaDevApp1.Properties.LoadBalancers');
            chai_1.expect(result).to.be.empty;
        };
        ServiceTest.prototype.service_role_undefined = function () {
            var result = _.get(this.resources, 'BlahVthaDevApp1.Properties.Role');
            chai_1.expect(result).to.be.undefined;
        };
        ServiceTest.prototype.environment_variables = function () {
            var result = _.get(this.resources, 'BlahVthaDevApp1TaskDefinition.Properties.ContainerDefinitions[0].Environment');
            chai_1.expect(result).to.be.empty;
        };
        return ServiceTest;
    }());
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "service_name_with_stage", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "service_load_balancers", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "service_role_undefined", null);
    __decorate([
        mocha_typescript_1.test
    ], ServiceTest.prototype, "environment_variables", null);
    ServiceTest = __decorate([
        mocha_typescript_1.suite
    ], ServiceTest);
});
