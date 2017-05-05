import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

import { expect } from 'chai';

import { Cluster } from '../cluster'

import { Service } from '../service'

import * as _ from 'lodash';

declare function describe(desc: string, cb: Function):any

describe('with an existing cluster and a load balanced container', () => {
  @suite class ServiceTest {
    cluster = {
      id: 'arn:aws:ecs:ap-southeast-2:005213230316:cluster/vtha-ECSCluster-1A5ZYNUN7X46N',
      security_group: 'sg-abcdef',
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
      url: '/',
      port: 1111,
      environment: [
        {blah: 'vtha'}
      ]
    }

    service:Service
    resources:any

    before() {
      let cluster = new Cluster(this.cluster);
      this.service = new Service(cluster, this.opts);
      this.resources = this.service.generate()
    }

    @test service_name(){
      expect(this.service.name).to.eql('BlahVthaDevApp1')
    }

    @test service_resource(){
      let result = _.get(this.resources, 'BlahVthaDevApp1.Type');
      expect(result).to.eql('AWS::ECS::Service');
    }

    @test task_definition_resource_type(){
      let result = _.get(this.resources, 'BlahVthaDevApp1TaskDefinition.Type');
      expect(result).to.eql('AWS::ECS::TaskDefinition');
    }

    @test task_definition_resource(){
      let result = _.get(this.resources, 'BlahVthaDevApp1TaskDefinition.Properties.ContainerDefinitions[0].Name');
      expect(result).to.eql('BlahVthaDevApp1');
    }

    @test environment_variables(){
      let result = _.get(this.resources, 'BlahVthaDevApp1TaskDefinition.Properties.ContainerDefinitions[0].Environment');
      expect(result).to.eql([{ Name: 'blah', Value: 'vtha' }]);
    }

    @test port_mappings(){
      let result = _.get(this.resources, 'BlahVthaDevApp1TaskDefinition.Properties.ContainerDefinitions[0].PortMappings');
      expect(result).to.eql([{'ContainerPort': 1111 }]);
    }

    @test service_role(){
      let result = _.get(this.resources, 'BlahVthaDevApp1.Properties.Role.Ref');
      expect(result).to.eql('ContainerlessELBRole');
    }

    @test service_load_balancers(){
      let result = _.get(this.resources, 'BlahVthaDevApp1.Properties.LoadBalancers');
      expect(result).to.not.be.empty;
    }
  }
});

describe('new cluster and container without load balancer', () => {
  @suite class ServiceTest {
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

    service:Service
    resources:any

    before() {
      let cluster = new Cluster(this.cluster);
      this.service = new Service(cluster, this.opts);
      this.resources = this.service.generate()
    }

    @test service_name(){
      expect(this.service.name).to.eql('BlahVthaDevApp1')
    }

    @test service_load_balancers(){
      let result = _.get(this.resources, 'BlahVthaDevApp1.Properties.LoadBalancers');
      expect(result).to.be.empty;
    }

    @test service_role_undefined(){
      let result = _.get(this.resources, 'BlahVthaDevApp1.Properties.Role');
      expect(result).to.be.undefined;
    }

    @test environment_variables(){
      let result = _.get(this.resources, 'BlahVthaDevApp1TaskDefinition.Properties.ContainerDefinitions[0].Environment');
      expect(result).to.be.empty;
    }

  }
});
