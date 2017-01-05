import * as _ from 'lodash';

import { Cluster } from './cluster'
import { Resource } from './resource'
import { Service } from './Service'

export class Listener implements Resource {

  service: Service
  cluster: Cluster
  priority: number

  constructor(service: Service, cluster: Cluster) {
    this.service = service;
    this.cluster = cluster;
  }

  get listenerRuleName() {
    return `${this.service.name}ListenerRule`;
  }

  get targetGroupName() {
    return `${this.service.name}TargetGroup`;
  }

  required() {
    return (this.service.url && this.service.port);
  }

  resources() {
    if (!this.required()) return {}

    let resources:any = {}

    resources[this.listenerRuleName] = {
      'Type' : 'AWS::ElasticLoadBalancingV2::ListenerRule',
      "DependsOn": ["ContainerlessListener", this.targetGroupName],
      'Properties' : {
        'Actions' : [
          {
            'TargetGroupArn' : {
              'Ref':  this.targetGroupName
          },
            'Type' : 'forward'
          }
        ],
        'Conditions' : [
          {
            'Field' : 'path-pattern',
            'Values' : [ this.service.url ]
          }
        ],
        'ListenerArn' : {'Ref': 'ContainerlessListener'},
        'Priority' : this.priority
      }
    }

    resources[this.targetGroupName] = {
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
