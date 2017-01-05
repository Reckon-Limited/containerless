import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

import { expect } from 'chai';

import { Cluster } from '../cluster'
import { Listener } from '../listener'
import { Service } from '../service'

import * as _ from 'lodash';

declare function describe(desc: string, cb: Function):any

describe('service with port and url', () => {
  @suite class ListenerTest {
    cluster = {
      vpcId: 'vpc-1',
      subnets: [
        'subnet-12359e64',
        'subnet-b442c0d0',
        'subnet-a2b967fb'
      ]
    }

    opts = {
      name: 'app-1',
      repository: 'blah/vtha',
      tag: 'tag-1',
      url: '/',
      port: 1111
    }

    listener: Listener
    resources: any

    before() {
      let cluster = new Cluster(this.cluster);
      let service = new Service(cluster, this.opts);

      this.listener = new Listener(service, cluster);
      this.resources = this.listener.resources();
    }

    @test listener_resource(){
      let result = _.get(this.resources, 'App1ListenerRule.Type');
      expect(result).to.eql('AWS::ElasticLoadBalancingV2::ListenerRule');
    }

    @test task_definition_resource_type(){
      let result = _.get(this.resources, 'App1TargetGroup.Type');
      expect(result).to.eql('AWS::ElasticLoadBalancingV2::TargetGroup');
    }

  }
});


describe('service does not require load balancing', () => {
  @suite class ListenerTest {
    cluster = {
      vpcId: 'vpc-1',
      subnets: [
        'subnet-12359e64',
        'subnet-b442c0d0',
        'subnet-a2b967fb'
      ]
    }

    opts = {
      name: 'app-1',
      repository: 'blah/vtha',
      tag: 'tag-1',
    }

    listener: Listener
    resources: any

    before() {
      let cluster = new Cluster(this.cluster);
      let service = new Service(cluster, this.opts);

      this.listener = new Listener(service, cluster);
      this.resources = this.listener.resources();
    }

    @test requireListener(){
      expect(this.listener.required()).to.be.undefined
    }

    @test listener_resources() {
      expect(this.resources).to.be.empty
    }

    @test listener_mapping() {
      expect(this.listener.mapping).to.be.empty
    }
  }
});
