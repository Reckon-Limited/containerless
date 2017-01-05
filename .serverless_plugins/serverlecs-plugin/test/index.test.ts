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

}
