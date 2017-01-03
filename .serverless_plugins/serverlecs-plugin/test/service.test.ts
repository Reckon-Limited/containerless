import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

import { expect } from 'chai';

import { Service } from '../service'

import * as _ from 'lodash';

const opts = {
  name:       'Blah',
  repository: 'blah/vtha',
  clusterId:  'arn:blah:vtha',
  port: 3000,
  path: '/blah/vtha/',
  load_balancer: {
    vpcId: 'vpc-123456',
    security_group: 'sg-123456',
    subnets: ['subnet-123456']
  }
}

@suite
class ServiceTest {

  resources: any;

  before() {
    let service = new Service(opts);
    this.resources = service.generateResources();
    console.log(this.resources)
  }

  @test('Service Resource')
  assert_service_resource() {
    let result = _.get(this.resources, 'blah.Type');
    expect(result).to.eq('AWS::ECS::Service')

    result = _.get(this.resources, 'blah.Properties.Cluster');
    expect(result).to.eq(opts.clusterId)
  }

  @test('Container Resource')
  assert_container_resource() {
    let result = _.get(this.resources, 'blahTaskDefinition.Type');
    expect(result).to.eq('AWS::ECS::TaskDefinition')

    result = _.get(this.resources, 'blahTaskDefinition.Properties.ContainerDefinitions[0].Name');
    expect(result).to.eq('blah')
  }

  // @test('ELB Resource')
  // assert_elb_resource() {
  //   let result = _.get(this.resources, 'ContainerlessELB.Type');
  //   expect(result).to.eq('AWS::ElasticLoadBalancingV2::LoadBalancer')
  // }
}
