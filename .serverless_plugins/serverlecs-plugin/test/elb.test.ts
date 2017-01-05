import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

import { expect } from 'chai';

import { Cluster } from '../cluster'
import { ELB } from '../elb'

import * as _ from 'lodash';

declare function describe(desc: string, cb: Function):any

describe('with an existing cluster', () => {
  @suite class ELBTest {
    opts = {
      id: 'arn:aws:ecs:ap-southeast-2:005213230316:cluster/vtha-ECSCluster-1A5ZYNUN7X46N',
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
      this.resources = this.elb.resources()
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
