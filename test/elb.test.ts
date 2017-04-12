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
      let result = _.get(this.resources, 'ContainerlessELB.Type');
      expect(result).to.eql('AWS::ElasticLoadBalancingV2::LoadBalancer')
    }

    @test elb_resource_security_group(){
      let result = _.get(this.resources, 'ContainerlessELB.Properties.SecurityGroups');
      expect(result).to.eql([this.opts.security_group])
    }

    @test elb_resource_subnets(){
      let result = _.get(this.resources, 'ContainerlessELB.Properties.Subnets');
      expect(result).to.eql(this.opts.subnets)
    }

    @test elb_resource_vpcId() {
      let result = _.get(this.resources, 'ContainerlessDefaultTargetGroup.Properties.VpcId');
      expect(result).to.eql(this.opts.vpcId)
    }
  }
});

describe('creating a new cluster with HTTPS', () => {
  @suite class ELBTest {
    opts = {
      vpcId: 'vpc-1',
      subnets: [
        'subnet-12359e64',
        'subnet-b442c0d0',
        'subnet-a2b967fb'
      ],
      protocol: 'HTTPS',
      certificate: 'arn:aws:acm:ap-southeast-2:000000000001:certificate/95898b22-e903-4d31-a50a-a0d4473aa077'
    }

    elb:ELB
    resources:any

    before() {
      let cluster = new Cluster(this.opts);
      this.elb = new ELB(cluster);
      this.resources = this.elb.generate()
    }

    @test elb_resource(){
      let result = _.get(this.resources, 'ContainerlessELB.Type');
      expect(result).to.eql('AWS::ElasticLoadBalancingV2::LoadBalancer')
    }

    @test elb_listener_certificate(){
      let result = _.get(this.resources, 'ContainerlessListener.Properties.Certificates[0].CertificateArn');
      expect(result).to.eql(this.opts.certificate)
    }

    @test elb_resource_subnets(){
      let result = _.get(this.resources, 'ContainerlessELB.Properties.Subnets');
      expect(result).to.eql(this.opts.subnets)
    }

    @test elb_resource_vpcId() {
      let result = _.get(this.resources, 'ContainerlessDefaultTargetGroup.Properties.VpcId');
      expect(result).to.eql(this.opts.vpcId)
    }
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
      let result = _.get(this.resources, 'ContainerlessELB.Type');
      expect(result).to.eql('AWS::ElasticLoadBalancingV2::LoadBalancer')
    }

    @test elb_listener_certificate(){
      let result = _.get(this.resources, 'ContainerlessListener.Properties.Certificates[0].CertificateArn');
      expect(result).to.be.empty
    }

    @test elb_resource_subnets(){
      let result = _.get(this.resources, 'ContainerlessELB.Properties.Subnets');
      expect(result).to.eql(this.opts.subnets)
    }

    @test elb_resource_vpcId() {
      let result = _.get(this.resources, 'ContainerlessDefaultTargetGroup.Properties.VpcId');
      expect(result).to.eql(this.opts.vpcId)
    }
  }
});
