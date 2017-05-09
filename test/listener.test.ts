import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

import { expect } from 'chai';

import { Cluster } from '../cluster'
import { Listener, reset } from '../listener'
import { Service } from '../service'

import * as _ from 'lodash';

declare function describe(desc: string, cb: Function):any

describe('service with port and url', () => {
  @suite class ListenerTest {
    clusterOpts = {
      vpcId: 'vpc-1',
      subnets: [
        'subnet-12359e64',
        'subnet-b442c0d0',
        'subnet-a2b967fb'
      ],
      protocol: ['HTTP']
    }

    opts = {
      service: 'blah-vtha-dev',
      name: 'app-1',
      repository: 'blah/vtha',
      tag: 'tag-1',
      url: '/',
      healthcheckPath: '/_health',
      port: 1111
    }

    cluster: Cluster
    service: Service
    listener: Listener
    resources: any

    before() {
      reset();
      this.cluster = new Cluster(this.clusterOpts);
      this.service = new Service(this.cluster, this.opts);

      this.listener = new Listener(this.service, this.cluster);
      this.resources = this.listener.generate();
    }

    @test listener_resource() {
      let result = _.get(this.resources, 'BlahVthaDevApp1HTTPRule.Type');
      expect(result).to.eql('AWS::ElasticLoadBalancingV2::ListenerRule');
    }

    @test task_definition_resource_type() {
      let result = _.get(this.resources, 'BlahVthaDevApp1Target.Type');
      expect(result).to.eql('AWS::ElasticLoadBalancingV2::TargetGroup');
    }

    @test task_definition_resource_healthCheckPath() {
      let result = _.get(this.resources, 'BlahVthaDevApp1Target.Properties.HealthCheckPath');
      expect(result).to.eql('/_health');
    }

    @test priority() {
      expect(this.listener.priority).to.eql(2);

      let listener = new Listener(this.service, this.cluster);
      expect(listener.priority).to.eql(3);
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
      service: 'blah-vtha-dev',
      name: 'app-1',
      repository: 'blah/vtha',
      tag: 'tag-1',
    }

    listener: Listener
    resources: any

    before() {
      reset();
      let cluster = new Cluster(this.cluster);
      let service = new Service(cluster, this.opts);

      this.listener = new Listener(service, cluster);
      this.resources = this.listener.generate();
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
