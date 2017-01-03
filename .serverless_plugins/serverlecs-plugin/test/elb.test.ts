import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

import { expect } from 'chai';

import { ELB, ELBOpts } from '../elb'

import * as _ from 'lodash';

const opts = {
    vpcId:          'blah:vtha',
    subnets:        ['subnet-a'],
    security_group: 'vtha'
}

// repository: 'blah/vtha',
// cluster:    'arn:blah:vtha',
// containers: [
//   {name: 'Container'}
// ]

@suite
class ServiceTest {

  resources: any;

  before() {
    let elb = new ELB(opts);
    this.resources = elb.generateResources();
    console.log(this.resources)
  }

  @test('Generates an ELB Resource')
  assert_elb_resource() {
    let result = _.get(this.resources, 'ContainerlessELB.Type');
    expect(result).to.eq('AWS::ElasticLoadBalancingV2::LoadBalancer')
  }

  @test('Generates an ELB Target with correct VPCId')
  assert_elb_vpcid() {
    let result = _.get(this.resources, 'ContainerlessDefaultTargetGroup.Properties.VpcId');
    expect(result).to.eq('blah:vtha');
  }

}
