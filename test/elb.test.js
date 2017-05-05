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
const elb_1 = require("../elb");
const _ = require("lodash");
describe('with an existing cluster', () => {
    let ELBTest = class ELBTest {
        constructor() {
            this.opts = {
                id: 'arn:aws:ecs:ap-southeast-2:000000000001:cluster/ECSCluster-XXXXXXXXXXXXX',
                security_group: 'sg-abcdef',
                vpcId: 'vpc-1',
                protocol: ['HTTP'],
                subnets: [
                    'subnet-12359e64',
                    'subnet-b442c0d0',
                    'subnet-a2b967fb'
                ]
            };
        }
        before() {
            let cluster = new cluster_1.Cluster(this.opts);
            this.elb = new elb_1.ELB(cluster);
            this.resources = this.elb.generate();
        }
        elb_resource() {
            let result = _.get(this.resources, 'ContainerlessELB.Type');
            chai_1.expect(result).to.eql('AWS::ElasticLoadBalancingV2::LoadBalancer');
        }
        elb_resource_security_group() {
            let result = _.get(this.resources, 'ContainerlessELB.Properties.SecurityGroups');
            chai_1.expect(result).to.eql([this.opts.security_group]);
        }
        elb_resource_subnets() {
            let result = _.get(this.resources, 'ContainerlessELB.Properties.Subnets');
            chai_1.expect(result).to.eql(this.opts.subnets);
        }
        elb_resource_vpcId() {
            let result = _.get(this.resources, 'ContainerlessHTTPTargetGroup.Properties.VpcId');
            chai_1.expect(result).to.eql(this.opts.vpcId);
        }
    };
    __decorate([
        mocha_typescript_1.test
    ], ELBTest.prototype, "elb_resource", null);
    __decorate([
        mocha_typescript_1.test
    ], ELBTest.prototype, "elb_resource_security_group", null);
    __decorate([
        mocha_typescript_1.test
    ], ELBTest.prototype, "elb_resource_subnets", null);
    __decorate([
        mocha_typescript_1.test
    ], ELBTest.prototype, "elb_resource_vpcId", null);
    ELBTest = __decorate([
        mocha_typescript_1.suite
    ], ELBTest);
});
describe('creating a new cluster with HTTP and HTTPS', () => {
    let ELBTest = class ELBTest {
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
            let cluster = new cluster_1.Cluster(this.opts);
            this.elb = new elb_1.ELB(cluster);
            this.resources = this.elb.generate();
        }
        generates_http_listener() {
            let result = _.get(this.resources, 'ContainerlessHTTPTargetGroup.Properties.Port');
            chai_1.expect(result).to.eql(80);
        }
        generates_https_listener() {
            let result = _.get(this.resources, 'ContainerlessHTTPSTargetGroup.Properties.Port');
            chai_1.expect(result).to.eql(443);
        }
    };
    __decorate([
        mocha_typescript_1.test
    ], ELBTest.prototype, "generates_http_listener", null);
    __decorate([
        mocha_typescript_1.test
    ], ELBTest.prototype, "generates_https_listener", null);
    ELBTest = __decorate([
        mocha_typescript_1.suite
    ], ELBTest);
});
describe('creating a new cluster with HTTP', () => {
    let ELBTest = class ELBTest {
        constructor() {
            this.opts = {
                vpcId: 'vpc-1',
                subnets: [
                    'subnet-12359e64',
                    'subnet-b442c0d0',
                    'subnet-a2b967fb'
                ],
                protocol: ['HTTP'],
            };
        }
        before() {
            let cluster = new cluster_1.Cluster(this.opts);
            this.elb = new elb_1.ELB(cluster);
            this.resources = this.elb.generate();
        }
        elb_resource() {
            let result = _.get(this.resources, 'ContainerlessELB.Type');
            chai_1.expect(result).to.eql('AWS::ElasticLoadBalancingV2::LoadBalancer');
        }
        elb_listener_certificate() {
            let result = _.get(this.resources, 'ContainerlessListener.Properties.Certificates[0].CertificateArn');
            chai_1.expect(result).to.be.empty;
        }
        elb_resource_subnets() {
            let result = _.get(this.resources, 'ContainerlessELB.Properties.Subnets');
            chai_1.expect(result).to.eql(this.opts.subnets);
        }
        elb_resource_vpcId() {
            let result = _.get(this.resources, 'ContainerlessHTTPTargetGroup.Properties.VpcId');
            chai_1.expect(result).to.eql(this.opts.vpcId);
        }
        generates_http_listener() {
            let result = _.get(this.resources, 'ContainerlessHTTPTargetGroup.Properties.Port');
            chai_1.expect(result).to.eql(80);
        }
    };
    __decorate([
        mocha_typescript_1.test
    ], ELBTest.prototype, "elb_resource", null);
    __decorate([
        mocha_typescript_1.test
    ], ELBTest.prototype, "elb_listener_certificate", null);
    __decorate([
        mocha_typescript_1.test
    ], ELBTest.prototype, "elb_resource_subnets", null);
    __decorate([
        mocha_typescript_1.test
    ], ELBTest.prototype, "elb_resource_vpcId", null);
    __decorate([
        mocha_typescript_1.test
    ], ELBTest.prototype, "generates_http_listener", null);
    ELBTest = __decorate([
        mocha_typescript_1.suite
    ], ELBTest);
});
