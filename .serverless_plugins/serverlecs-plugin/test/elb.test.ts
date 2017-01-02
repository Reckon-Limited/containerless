import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

import { expect } from 'chai';

import { ELB, ELBOpts } from '../elb'

import * as _ from 'lodash';

const service = {
  name:         'Blah',
  loadBalancer: {
    vpcId:   'blah:vtha',
    subnets: ['subnet-a']
  }
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
    let elb = new ELB(service);
    this.resources = elb.generateResources();
  }

  @test('Generates an ELB Resource')
  assert_elb_resource() {
    let result = _.get(this.resources, 'BlahELB.Type');
    expect(result).to.eq('AWS::ElasticLoadBalancingV2::LoadBalancer')
  }

  @test('Generates an ELB Target with correct VPCId')
  assert_elb_vpcid() {
    let result = _.get(this.resources, 'BlahTargetGroup.Properties.VpcId');
    expect(result).to.eq('blah:vtha');
  }

}
