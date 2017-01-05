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
      expect(this.cluster.resources()).to.be.empty
    }

  }
});

describe('create a new cluster', () => {
  @suite class ClusterTest {
    opts = {
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
      expect(this.cluster.id).to.eql({'Ref': 'ContainerlessCluster'})
    }

    @test resources_not_empty(){
      expect(this.cluster.resources()).to.not.be.empty
    }

  }
});





// cluster:
//   instance_type: t2.small
//   subnets:
//     - subnet-12359e64
//     - subnet-b442c0d0
//     - subnet-a2b967fb
// repository: 005213230316.dkr.ecr.ap-southeast-2.amazonaws.com/serverlecs
// vpcId:
//   Fn::ImportValue: triple-az-vpc-VpcID
// applications:
//   hello-1:
//     srcPath: src-1
//     urlPath: /
//     port: 3000
//     memory: 128
//   hello-2:
//     srcPath: src-2
//     urlPath: /hello
//     port: 3000
//     memory: 128
