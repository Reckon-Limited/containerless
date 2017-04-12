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
var elb_1 = require("../elb");
var _ = require("lodash");
describe('with an existing cluster', function () {
    var ELBTest = (function () {
        function ELBTest() {
            this.opts = {
                id: 'arn:aws:ecs:ap-southeast-2:000000000001:cluster/ECSCluster-XXXXXXXXXXXXX',
                security_group: 'sg-abcdef',
                vpcId: 'vpc-1',
                subnets: [
                    'subnet-12359e64',
                    'subnet-b442c0d0',
                    'subnet-a2b967fb'
                ]
            };
        }
        ELBTest.prototype.before = function () {
            var cluster = new cluster_1.Cluster(this.opts);
            this.elb = new elb_1.ELB(cluster);
            this.resources = this.elb.generate();
        };
        ELBTest.prototype.elb_resource = function () {
            var result = _.get(this.resources, 'ContainerlessELB.Type');
            chai_1.expect(result).to.eql('AWS::ElasticLoadBalancingV2::LoadBalancer');
        };
        ELBTest.prototype.elb_resource_security_group = function () {
            var result = _.get(this.resources, 'ContainerlessELB.Properties.SecurityGroups');
            chai_1.expect(result).to.eql([this.opts.security_group]);
        };
        ELBTest.prototype.elb_resource_subnets = function () {
            var result = _.get(this.resources, 'ContainerlessELB.Properties.Subnets');
            chai_1.expect(result).to.eql(this.opts.subnets);
        };
        ELBTest.prototype.elb_resource_vpcId = function () {
            var result = _.get(this.resources, 'ContainerlessDefaultTargetGroup.Properties.VpcId');
            chai_1.expect(result).to.eql(this.opts.vpcId);
        };
        return ELBTest;
    }());
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
describe('creating a new cluster with HTTPS', function () {
    var ELBTest = (function () {
        function ELBTest() {
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
        ELBTest.prototype.before = function () {
            var cluster = new cluster_1.Cluster(this.opts);
            this.elb = new elb_1.ELB(cluster);
            this.resources = this.elb.generate();
        };
        ELBTest.prototype.elb_resource = function () {
            var result = _.get(this.resources, 'ContainerlessELB.Type');
            chai_1.expect(result).to.eql('AWS::ElasticLoadBalancingV2::LoadBalancer');
        };
        ELBTest.prototype.elb_listener_certificate = function () {
            var result = _.get(this.resources, 'ContainerlessListener.Properties.Certificates[0].CertificateArn');
            chai_1.expect(result).to.eql(this.opts.certificate);
        };
        ELBTest.prototype.elb_resource_subnets = function () {
            var result = _.get(this.resources, 'ContainerlessELB.Properties.Subnets');
            chai_1.expect(result).to.eql(this.opts.subnets);
        };
        ELBTest.prototype.elb_resource_vpcId = function () {
            var result = _.get(this.resources, 'ContainerlessDefaultTargetGroup.Properties.VpcId');
            chai_1.expect(result).to.eql(this.opts.vpcId);
        };
        return ELBTest;
    }());
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
    ELBTest = __decorate([
        mocha_typescript_1.suite
    ], ELBTest);
});
describe('creating a new cluster with HTTP', function () {
    var ELBTest = (function () {
        function ELBTest() {
            this.opts = {
                vpcId: 'vpc-1',
                subnets: [
                    'subnet-12359e64',
                    'subnet-b442c0d0',
                    'subnet-a2b967fb'
                ]
            };
        }
        ELBTest.prototype.before = function () {
            var cluster = new cluster_1.Cluster(this.opts);
            this.elb = new elb_1.ELB(cluster);
            this.resources = this.elb.generate();
        };
        ELBTest.prototype.elb_resource = function () {
            var result = _.get(this.resources, 'ContainerlessELB.Type');
            chai_1.expect(result).to.eql('AWS::ElasticLoadBalancingV2::LoadBalancer');
        };
        ELBTest.prototype.elb_listener_certificate = function () {
            var result = _.get(this.resources, 'ContainerlessListener.Properties.Certificates[0].CertificateArn');
            chai_1.expect(result).to.be.empty;
        };
        ELBTest.prototype.elb_resource_subnets = function () {
            var result = _.get(this.resources, 'ContainerlessELB.Properties.Subnets');
            chai_1.expect(result).to.eql(this.opts.subnets);
        };
        ELBTest.prototype.elb_resource_vpcId = function () {
            var result = _.get(this.resources, 'ContainerlessDefaultTargetGroup.Properties.VpcId');
            chai_1.expect(result).to.eql(this.opts.vpcId);
        };
        return ELBTest;
    }());
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
    ELBTest = __decorate([
        mocha_typescript_1.suite
    ], ELBTest);
});
