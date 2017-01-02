"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var mocha_typescript_1 = require("mocha-typescript");
var chai_1 = require("chai");
var elb_1 = require("../elb");
var _ = require("lodash");
var service = {
    name: 'Blah',
    loadBalancer: {
        vpcId: 'blah:vtha',
        subnets: ['subnet-a']
    }
};
// repository: 'blah/vtha',
// cluster:    'arn:blah:vtha',
// containers: [
//   {name: 'Container'}
// ]
var ServiceTest = (function () {
    function ServiceTest() {
    }
    ServiceTest.prototype.before = function () {
        var elb = new elb_1.ELB(service);
        this.resources = elb.generateResources();
    };
    ServiceTest.prototype.assert_elb_resource = function () {
        var result = _.get(this.resources, 'BlahELB.Type');
        chai_1.expect(result).to.eq('AWS::ElasticLoadBalancingV2::LoadBalancer');
    };
    ServiceTest.prototype.assert_elb_vpcid = function () {
        var result = _.get(this.resources, 'BlahTargetGroup.Properties.VpcId');
        chai_1.expect(result).to.eq('blah:vtha');
    };
    return ServiceTest;
}());
__decorate([
    mocha_typescript_1.test('Generates an ELB Resource')
], ServiceTest.prototype, "assert_elb_resource", null);
__decorate([
    mocha_typescript_1.test('Generates an ELB Target with correct VPCId')
], ServiceTest.prototype, "assert_elb_vpcid", null);
ServiceTest = __decorate([
    mocha_typescript_1.suite
], ServiceTest);
