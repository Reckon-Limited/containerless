import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

import { expect } from 'chai';

import ServerlecsPlugin = require('../index');

import * as _ from 'lodash';

const containerless = {
    name:       'Blah',
    repository: 'blah/vtha',
    clusterId:  'arn:blah:vtha',
    load_balancer: {
      vpcId: 'vpc-123456'
    },
    applications: [
      {name: 'Container'}
    ]
  }

@suite
class ServerlecsPluginTest {
  plugin: ServerlecsPlugin

  before() {
    let serverless = {}
    _.set(serverless, 'service.custom.containerless', containerless)
    _.set(serverless, 'processedInput.options.tag', 'tag')
    _.set(serverless, 'config.servicePath', '/blah/vtha')
    _.set(serverless, 'cli.log', ()=>{})

    this.plugin = new ServerlecsPlugin(serverless,{});
  }

  @test('Flattens configuration')
  assert_flattens_config() {
    let result = this.plugin.prepare();
    expect(result).to.be.an('array')
    expect(result[0]).to.have.property('name');
    expect(result[0]).to.have.property('load_balancer');
    expect(result[0]).to.have.property('path');
    expect(result[0]).to.have.property('image');
  }

}
