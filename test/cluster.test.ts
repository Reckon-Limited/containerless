import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

import { expect } from 'chai';

import { Cluster } from '../cluster'

import * as _ from 'lodash';

declare function describe(desc: string, cb: Function):any

describe('with existing cluster', () => {
  @suite class ClusterTest {
    opts = {
      id: 'arn:aws:ecs:ap-southeast-2:005213230316:cluster/vtha-ECSCluster-1A5ZYNUN7X46N',
      security_group: 'sg-abcdef',
      vpcId: 'vpc-1',
      subnets: [
        'subnet-12359e64',
        'subnet-b442c0d0',
        'subnet-a2b967fb'
      ]
    }

    cluster:Cluster

    before() {
      this.cluster = new Cluster(this.opts);
    }

    @test id() {
      expect(this.cluster.id).to.eq(this.opts.id)
    }

    @test resources_empty(){
      expect(this.cluster.generate()).to.be.empty
    }

  }
});

describe('create a new cluster with HTTPS', () => {
  @suite class ClusterTest {
    opts = {
      vpcId: 'vpc-1',
      subnets: [
        'subnet-12359e64',
        'subnet-b442c0d0',
        'subnet-a2b967fb'
      ],
      protocol: 'HTTPS',
      certificate: 'arn:aws:acm:ap-southeast-2:000000000001:certificate/95898b22-e903-4d31-a50a-a0d4473aa077'
    }

    cluster:Cluster
    before() {
      this.cluster = new Cluster(this.opts);
    }

    @test id() {
      expect(this.cluster.id).to.eql({'Ref': 'ContainerlessCluster'})
    }

    @test resources_not_empty(){
      expect(this.cluster.generate()).to.not.be.empty
    }

    @test sets_protocol(){
      expect(this.cluster.protocol).to.eql('HTTPS')
    }

    @test sets_port(){
      expect(this.cluster.port).to.eql(443)
    }

  }
});


describe('create a new cluster with HTTP', () => {
  @suite class ClusterTest {
    opts = {
      vpcId: 'vpc-1',
      subnets: [
        'subnet-12359e64',
        'subnet-b442c0d0',
        'subnet-a2b967fb'
      ],
      protocol: 'HTTP'
    }

    cluster:Cluster
    before() {
      this.cluster = new Cluster(this.opts);
    }

    @test id() {
      expect(this.cluster.id).to.eql({'Ref': 'ContainerlessCluster'})
    }

    @test resources_not_empty(){
      expect(this.cluster.generate()).to.not.be.empty
    }

    @test sets_protocol(){
      expect(this.cluster.protocol).to.eql('HTTP')
    }

    @test sets_port(){
      expect(this.cluster.port).to.eql(80)
    }
  }
});
