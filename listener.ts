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

  required() {
    return (this.service.url && this.service.port);
  }

  generate() {
    if (!this.required()) return []
    return _.map(this.cluster.protocol, (protocol) => {
      return this.generateForProtocol(protocol);
    });
  }

  generateForProtocol(protocol: string) {

    let listenerRuleName = `${this.service.name}${protocol}Rule`;
    let targetGroupName = `${this.service.name}${protocol}Target`;

    let resources:any = {
      [listenerRuleName]: {
      'Type' : 'AWS::ElasticLoadBalancingV2::ListenerRule',
      "DependsOn": [`Cls${protocol}Listener`, `Cls${protocol}TargetGroup`, targetGroupName],
      'Properties' : {
        'Actions' : [
          {
            'TargetGroupArn' : { 'Ref':  targetGroupName },
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
      },
      [targetGroupName]: {
        'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
        'Properties': {
          'Name': targetGroupName,
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

    return resources;
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
