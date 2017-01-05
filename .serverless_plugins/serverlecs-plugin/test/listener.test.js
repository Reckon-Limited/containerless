"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var mocha_typescript_1 = require("mocha-typescript");
var chai_1 = require("chai");
var cluster_1 = require("../cluster");
var listener_1 = require("../listener");
var service_1 = require("../service");
var _ = require("lodash");
describe('service with port and url', function () {
    var ListenerTest = (function () {
        function ListenerTest() {
            this.cluster = {
                vpcId: 'vpc-1',
                subnets: [
                    'subnet-12359e64',
                    'subnet-b442c0d0',
                    'subnet-a2b967fb'
                ]
            };
            this.opts = {
                name: 'app-1',
                repository: 'blah/vtha',
                tag: 'tag-1',
                url: '/',
                port: 1111
            };
        }
        ListenerTest.prototype.before = function () {
            var cluster = new cluster_1.Cluster(this.cluster);
            var service = new service_1.Service(cluster, this.opts);
            this.listener = new listener_1.Listener(service, cluster);
            this.resources = this.listener.resources();
        };
        ListenerTest.prototype.listener_resource = function () {
            var result = _.get(this.resources, 'App1ListenerRule.Type');
            chai_1.expect(result).to.eql('AWS::ElasticLoadBalancingV2::ListenerRule');
        };
        ListenerTest.prototype.task_definition_resource_type = function () {
            var result = _.get(this.resources, 'App1TargetGroup.Type');
            chai_1.expect(result).to.eql('AWS::ElasticLoadBalancingV2::TargetGroup');
        };
        return ListenerTest;
    }());
    __decorate([
        mocha_typescript_1.test
    ], ListenerTest.prototype, "listener_resource", null);
    __decorate([
        mocha_typescript_1.test
    ], ListenerTest.prototype, "task_definition_resource_type", null);
    ListenerTest = __decorate([
        mocha_typescript_1.suite
    ], ListenerTest);
});
describe('service does not require load balancing', function () {
    var ListenerTest = (function () {
        function ListenerTest() {
            this.cluster = {
                vpcId: 'vpc-1',
                subnets: [
                    'subnet-12359e64',
                    'subnet-b442c0d0',
                    'subnet-a2b967fb'
                ]
            };
            this.opts = {
                name: 'app-1',
                repository: 'blah/vtha',
                tag: 'tag-1',
            };
        }
        ListenerTest.prototype.before = function () {
            var cluster = new cluster_1.Cluster(this.cluster);
            var service = new service_1.Service(cluster, this.opts);
            this.listener = new listener_1.Listener(service, cluster);
            this.resources = this.listener.resources();
        };
        ListenerTest.prototype.requireListener = function () {
            chai_1.expect(this.listener.required()).to.be.undefined;
        };
        ListenerTest.prototype.listener_resources = function () {
            chai_1.expect(this.resources).to.be.empty;
        };
        ListenerTest.prototype.listener_mapping = function () {
            chai_1.expect(this.listener.mapping).to.be.empty;
        };
        return ListenerTest;
    }());
    __decorate([
        mocha_typescript_1.test
    ], ListenerTest.prototype, "requireListener", null);
    __decorate([
        mocha_typescript_1.test
    ], ListenerTest.prototype, "listener_resources", null);
    __decorate([
        mocha_typescript_1.test
    ], ListenerTest.prototype, "listener_mapping", null);
    ListenerTest = __decorate([
        mocha_typescript_1.suite
    ], ListenerTest);
});
