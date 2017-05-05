"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_typescript_1 = require("mocha-typescript");
const chai_1 = require("chai");
const cluster_1 = require("../cluster");
const listener_1 = require("../listener");
const service_1 = require("../service");
const _ = require("lodash");
describe('service with port and url', () => {
    let ListenerTest = class ListenerTest {
        constructor() {
            this.clusterOpts = {
                vpcId: 'vpc-1',
                subnets: [
                    'subnet-12359e64',
                    'subnet-b442c0d0',
                    'subnet-a2b967fb'
                ],
                protocol: ['HTTP']
            };
            this.opts = {
                service: 'blah-vtha-dev',
                name: 'app-1',
                repository: 'blah/vtha',
                tag: 'tag-1',
                url: '/',
                port: 1111
            };
        }
        before() {
            listener_1.reset();
            this.cluster = new cluster_1.Cluster(this.clusterOpts);
            this.service = new service_1.Service(this.cluster, this.opts);
            this.listener = new listener_1.Listener(this.service, this.cluster);
            this.resources = this.listener.generate();
        }
        listener_resource() {
            let result = _.get(this.resources[0], 'BlahVthaDevApp1HTTPRule.Type');
            chai_1.expect(result).to.eql('AWS::ElasticLoadBalancingV2::ListenerRule');
        }
        task_definition_resource_type() {
            let result = _.get(this.resources[0], 'BlahVthaDevApp1HTTPTarget.Type');
            chai_1.expect(result).to.eql('AWS::ElasticLoadBalancingV2::TargetGroup');
        }
        priority() {
            chai_1.expect(this.listener.priority).to.eql(2);
            let listener = new listener_1.Listener(this.service, this.cluster);
            chai_1.expect(listener.priority).to.eql(3);
        }
    };
    __decorate([
        mocha_typescript_1.test
    ], ListenerTest.prototype, "listener_resource", null);
    __decorate([
        mocha_typescript_1.test
    ], ListenerTest.prototype, "task_definition_resource_type", null);
    __decorate([
        mocha_typescript_1.test
    ], ListenerTest.prototype, "priority", null);
    ListenerTest = __decorate([
        mocha_typescript_1.suite
    ], ListenerTest);
});
describe('service does not require load balancing', () => {
    let ListenerTest = class ListenerTest {
        constructor() {
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
                tag: 'tag-1',
            };
        }
        before() {
            listener_1.reset();
            let cluster = new cluster_1.Cluster(this.cluster);
            let service = new service_1.Service(cluster, this.opts);
            this.listener = new listener_1.Listener(service, cluster);
            this.resources = this.listener.generate();
        }
        requireListener() {
            chai_1.expect(this.listener.required()).to.be.undefined;
        }
        listener_resources() {
            chai_1.expect(this.resources).to.be.empty;
        }
        listener_mapping() {
            chai_1.expect(this.listener.mapping).to.be.empty;
        }
    };
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
