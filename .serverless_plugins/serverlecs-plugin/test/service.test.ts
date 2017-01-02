import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

import { expect } from 'chai';

import { Service } from '../service'

import * as _ from 'lodash';

const opts = {
  name:       'Blah',
  repository: 'blah/vtha',
  cluster:    'arn:blah:vtha',
  containers: [
    {name: 'Container'}
  ]
}

// @suite
class ServiceTest {

  resources: any;

  before() {
    let service = new Service(opts);
    this.resources = service.generateResources();
  }

  @test('Service Resource')
  assert_service_resource() {
    let result = _.get(this.resources, 'Blah.Type');
    expect(result).to.eq('AWS::ECS::Service')

    result = _.get(this.resources, 'Blah.Properties.Cluster');
    expect(result).to.eq(opts.cluster)
  }

  @test('Container Resource')
  assert_container_resource() {
    let result = _.get(this.resources, 'BlahTaskDefinition.Type');
    expect(result).to.eq('AWS::ECS::TaskDefinition')

    result = _.get(this.resources, 'BlahTaskDefinition.Properties.ContainerDefinitions[0].Name');
    expect(result).to.eq('Container')
  }
}
