import * as _ from 'lodash';

import { Cluster } from './cluster'
import { Resource } from './resource'
import { Service } from './Service'

// this is a terrible idea
let priority = 0;

export class Listener implements Resource {

  service: Service
  cluster: Cluster
  priority: number

  constructor(service: Service, cluster: Cluster) {
    this.service = service;
    this.cluster = cluster;
    this.priority = this.calculatePriority();
  }

  calculatePriority() {
    return priority = priority + 1;
  }

  get name() {
    return `${this.service.name}Listener`;
  }

  get targetGroupName() {
    return `${this.service.name}Target`;
  }

  required() {
    return (this.service.url && this.service.port);
  }

  generate() {
    if (!this.required()) return []

    let definition: any = {
      [this.targetGroupName]: {
        'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
        'Properties': {
          'Name': this.targetGroupName,
          'HealthCheckIntervalSeconds': 10,
          'HealthCheckPath': '/',
          'HealthCheckProtocol': 'HTTP',
          'HealthCheckTimeoutSeconds': 5,
          'HealthyThresholdCount': 2,
          'Port': 80,
          'Protocol': 'HTTP',
          'UnhealthyThresholdCount': 2,
          'VpcId': this.cluster.vpcId
        }
      }
    }

    _.each(this.cluster.protocol, (protocol) => {
      definition[`${this.service.name}${protocol}Rule`] = this.generateForProtocol(protocol);
    });

    return definition;
  }

  generateForProtocol(protocol: string) {
    return {
      'Type' : 'AWS::ElasticLoadBalancingV2::ListenerRule',
      "DependsOn": [`Cls${protocol}Listener`, `Cls${protocol}TargetGroup`, this.targetGroupName],
      'Properties' : {
        'Actions' : [
          {
            'TargetGroupArn' : { 'Ref':  this.targetGroupName },
            'Type' : 'forward'
          }
        ],
        'Conditions' : [
          {
            'Field' : 'path-pattern',
            'Values' : [ this.service.url ]
          }
        ],
        'ListenerArn' : {'Ref': `Cls${protocol}Listener`},
        'Priority' : this.priority
      }
    }
  }

  get mapping() {
    if (!this.required()) return []

    return [{
      'ContainerName': this.service.name,
      'ContainerPort': this.service.port,
      'TargetGroupArn': {
        'Ref': this.targetGroupName
      }
    }];

  }

}

export function reset() {
  priority = 0;
}
