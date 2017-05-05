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
describe('with existing cluster', () => {
    let ClusterTest = class ClusterTest {
        constructor() {
            this.opts = {
                id: 'arn:aws:ecs:ap-southeast-2:005213230316:cluster/vtha-ECSCluster-1A5ZYNUN7X46N',
                security_group: 'sg-abcdef',
                vpcId: 'vpc-1',
                subnets: [
                    'subnet-12359e64',
                    'subnet-b442c0d0',
                    'subnet-a2b967fb'
                ]
            };
        }
        before() {
            this.cluster = new cluster_1.Cluster(this.opts);
        }
        id() {
            chai_1.expect(this.cluster.id).to.eq(this.opts.id);
        }
        resources_empty() {
            chai_1.expect(this.cluster.generate()).to.be.empty;
        }
    };
    __decorate([
        mocha_typescript_1.test
    ], ClusterTest.prototype, "id", null);
    __decorate([
        mocha_typescript_1.test
    ], ClusterTest.prototype, "resources_empty", null);
    ClusterTest = __decorate([
        mocha_typescript_1.suite
    ], ClusterTest);
});
describe('create a new cluster with HTTPS', () => {
    let ClusterTest = class ClusterTest {
        constructor() {
            this.opts = {
                vpcId: 'vpc-1',
                subnets: [
                    'subnet-12359e64',
                    'subnet-b442c0d0',
                    'subnet-a2b967fb'
                ],
                protocol: 'HTTPS',
                certificate: 'arn:aws:acm:ap-southeast-2:000000000001:certificate/95898b22-e903-4d31-a50a-a0d4473aa077'
            };
        }
        before() {
            this.cluster = new cluster_1.Cluster(this.opts);
        }
        id() {
            chai_1.expect(this.cluster.id).to.eql({ 'Ref': 'ContainerlessCluster' });
        }
        resources_not_empty() {
            chai_1.expect(this.cluster.generate()).to.not.be.empty;
        }
        sets_protocol() {
            chai_1.expect(this.cluster.protocol).to.eql(['HTTPS']);
        }
    };
    __decorate([
        mocha_typescript_1.test
    ], ClusterTest.prototype, "id", null);
    __decorate([
        mocha_typescript_1.test
    ], ClusterTest.prototype, "resources_not_empty", null);
    __decorate([
        mocha_typescript_1.test
    ], ClusterTest.prototype, "sets_protocol", null);
    ClusterTest = __decorate([
        mocha_typescript_1.suite
    ], ClusterTest);
});
describe('create a new cluster with both HTTP and HTTPS', () => {
    let ClusterTest = class ClusterTest {
        constructor() {
            this.opts = {
                vpcId: 'vpc-1',
                subnets: [
                    'subnet-12359e64',
                    'subnet-b442c0d0',
                    'subnet-a2b967fb'
                ],
                protocol: ['HTTP', 'HTTPS'],
                certificate: 'arn:aws:acm:ap-southeast-2:000000000001:certificate/95898b22-e903-4d31-a50a-a0d4473aa077'
            };
        }
        before() {
            this.cluster = new cluster_1.Cluster(this.opts);
        }
        id() {
            chai_1.expect(this.cluster.id).to.eql({ 'Ref': 'ContainerlessCluster' });
        }
        resources_not_empty() {
            chai_1.expect(this.cluster.generate()).to.not.be.empty;
        }
        sets_protocol() {
            console.log(this.cluster.protocol);
            chai_1.expect(this.cluster.protocol).to.eql(['HTTP', 'HTTPS']);
        }
    };
    __decorate([
        mocha_typescript_1.test
    ], ClusterTest.prototype, "id", null);
    __decorate([
        mocha_typescript_1.test
    ], ClusterTest.prototype, "resources_not_empty", null);
    __decorate([
        mocha_typescript_1.test
    ], ClusterTest.prototype, "sets_protocol", null);
    ClusterTest = __decorate([
        mocha_typescript_1.suite
    ], ClusterTest);
});
describe('create a new cluster with HTTP', () => {
    let ClusterTest = class ClusterTest {
        constructor() {
            this.opts = {
                vpcId: 'vpc-1',
                subnets: [
                    'subnet-12359e64',
                    'subnet-b442c0d0',
                    'subnet-a2b967fb'
                ],
                protocol: 'HTTP'
            };
        }
        before() {
            this.cluster = new cluster_1.Cluster(this.opts);
        }
        id() {
            chai_1.expect(this.cluster.id).to.eql({ 'Ref': 'ContainerlessCluster' });
        }
        resources_not_empty() {
            chai_1.expect(this.cluster.generate()).to.not.be.empty;
        }
        sets_protocol() {
            chai_1.expect(this.cluster.protocol).to.eql(['HTTP']);
        }
    };
    __decorate([
        mocha_typescript_1.test
    ], ClusterTest.prototype, "id", null);
    __decorate([
        mocha_typescript_1.test
    ], ClusterTest.prototype, "resources_not_empty", null);
    __decorate([
        mocha_typescript_1.test
    ], ClusterTest.prototype, "sets_protocol", null);
    ClusterTest = __decorate([
        mocha_typescript_1.suite
    ], ClusterTest);
});
