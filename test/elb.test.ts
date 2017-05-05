import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

import { expect } from 'chai';

import { Cluster } from '../cluster'
import { ELB } from '../elb'

import * as _ from 'lodash';



declare function describe(desc: string, cb: Function):any

describe('with an existing cluster', () => {
  @suite class ELBTest {
    opts = {
      id: 'arn:aws:ecs:ap-southeast-2:000000000001:cluster/ECSCluster-XXXXXXXXXXXXX',
      security_group: 'sg-abcdef',
      vpcId: 'vpc-1',
      protocol: ['HTTP'],
      subnets: [
        'subnet-12359e64',
        'subnet-b442c0d0',
        'subnet-a2b967fb'
      ]
    }

    elb:ELB
    resources:any

    before() {
      let cluster = new Cluster(this.opts);
      this.elb = new ELB(cluster);
      this.resources = this.elb.generate()
    }

    @test elb_resource(){
      let result = _.get(this.resources, 'ClsELB.Type');
      expect(result).to.eql('AWS::ElasticLoadBalancingV2::LoadBalancer')
    }

    @test elb_resource_security_group(){
      let result = _.get(this.resources, 'ClsELB.Properties.SecurityGroups');
      expect(result).to.eql([this.opts.security_group])
    }

    @test elb_resource_subnets(){
      let result = _.get(this.resources, 'ClsELB.Properties.Subnets');
      expect(result).to.eql(this.opts.subnets)
    }

    @test elb_resource_vpcId() {
      let result = _.get(this.resources, 'ClsHTTPTargetGroup.Properties.VpcId');
      expect(result).to.eql(this.opts.vpcId)
    }
  }
});

describe('creating a new cluster with HTTP and HTTPS', () => {
  @suite class ELBTest {
    opts = {
      vpcId: 'vpc-1',
      subnets: [
        'subnet-12359e64',
        'subnet-b442c0d0',
        'subnet-a2b967fb'
      ],
      protocol: ['HTTP','HTTPS'],
      certificate: 'arn:aws:acm:ap-southeast-2:000000000001:certificate/95898b22-e903-4d31-a50a-a0d4473aa077'
    }

    elb:ELB
    resources:any

    before() {
      let cluster = new Cluster(this.opts);
      this.elb = new ELB(cluster);
      this.resources = this.elb.generate()
    }

    @test generates_http_listener() {
      let result = _.get(this.resources, 'ClsHTTPTargetGroup.Properties.Port');
      expect(result).to.eql(80)
    }

    @test generates_https_listener() {
      let result = _.get(this.resources, 'ClsHTTPSTargetGroup.Properties.Port');
      expect(result).to.eql(443)
    }
});


describe('creating a new cluster with HTTP', () => {
  @suite class ELBTest {
    opts = {
      vpcId: 'vpc-1',
      subnets: [
        'subnet-12359e64',
        'subnet-b442c0d0',
        'subnet-a2b967fb'
      ],
      protocol: ['HTTP'],
    }

    elb:ELB
    resources:any

    before() {
      let cluster = new Cluster(this.opts);
      this.elb = new ELB(cluster);
      this.resources = this.elb.generate()
    }

    @test elb_resource(){
      let result = _.get(this.resources, 'ClsELB.Type');
      expect(result).to.eql('AWS::ElasticLoadBalancingV2::LoadBalancer')
    }

    @test elb_listener_certificate(){
      let result = _.get(this.resources, 'ClsHTTPListener.Properties.Certificates[0].CertificateArn');
      expect(result).to.be.empty
    }

    @test elb_resource_subnets(){
      let result = _.get(this.resources, 'ClsELB.Properties.Subnets');
      expect(result).to.eql(this.opts.subnets)
    }

    @test elb_resource_vpcId() {
      let result = _.get(this.resources, 'ClsHTTPTargetGroup.Properties.VpcId');
      expect(result).to.eql(this.opts.vpcId)
    }

    @test generates_http_listener() {
      let result = _.get(this.resources, 'ClsHTTPTargetGroup.Properties.Port');
      expect(result).to.eql(80)
    }

  }
});
