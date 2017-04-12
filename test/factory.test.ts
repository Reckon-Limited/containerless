import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

import { expect } from 'chai';

import { prepare } from '../factory'

import { Cluster } from '../cluster'
import { Resource } from '../resource'
import { Service } from '../service'


import * as _ from 'lodash';

declare function describe(desc: string, cb: Function):any

describe('', () => {
  @suite class FactoryTest {
    tag = 'tag-123abc';

    opts = {
      repository: 'blah/vtha',
      service: 'blah-vtha-dev',
      cluster: {
        id: 'arn:aws:ecs:ap-southeast-2:005213230316:cluster/vtha-ECSCluster-1A5ZYNUN7X46N',
        security_group: 'sg-abcdef',
        vpcId: 'vpc-1',
        subnets: [
          'subnet-12359e64',
          'subnet-b442c0d0',
          'subnet-a2b967fb'
        ],
      },
      applications: {
        'app-1': {
          url: '/',
          port: 1111
        }
      }
    }

    resources: Array<Resource>

    before() {
      this.resources = prepare(this.tag, this.opts)
    }

    @test has_resources(){
      expect(this.resources).to.have.any
      expect(this.resources).to.have.length(3)
    }

    @test has_service(){
      let service = this.resources[0];
      expect(service).to.have.property('name');
      expect(service).to.have.property('port');
      expect(service).to.have.property('url');
    }


    @test service_name(){
      let service = this.resources[0];
      expect(service.name).to.eq('BlahVthaDevApp1')
    }

    @test has_cluster(){
      let cluster = this.resources[1];
      expect(cluster).to.have.property('id');
      expect(cluster).to.have.property('vpcId');
      expect(cluster).to.have.property('subnets');
    }
  }
});
