import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

import { expect } from 'chai';

import ServerlecsPlugin = require('../index');

import * as _ from 'lodash';

const app = {
  name: 'Container',
  load_balancer: {
    subnets: 'blah-vtha'
  }
}

const otherApp = {
  name: 'Container',
  load_balancer: {
    subnets: 'blah-vtha'
  }
}

const containerless = {
    name:       'Blah',
    repository: 'blah/vtha',
    clusterId:  'arn:blah:vtha',
    load_balancer: {
      vpcId: 'vpc-123456'
    },
    applications: [app, otherApp]
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

  @test('Sets service default ')
  assert_service_defaults() {
    expect(this.plugin.service).to.have.property('log_retention');
    expect(this.plugin.service.log_retention).to.eq(7);
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


  @test('Prepares app configuration')
  assert_app_config() {
    let result = this.plugin.prepareApplication('app', app);
    expect(result.name).to.eq('app')
    expect(result.load_balancer.vpcId).to.eq(containerless.load_balancer.vpcId)
    expect(result.load_balancer.subnets).to.eq(app.load_balancer.subnets)
  }

  @test('Sets app priority')
  assert_app_priority() {
    let result = this.plugin.prepare();
    _.each(result, (app:any, idx:number) => {
      expect(app.priority).to.eq(idx+1)
    });
  }

}
