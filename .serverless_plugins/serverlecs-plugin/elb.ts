import _ = require('lodash');

import { Cluster } from './cluster'
import { Resource } from './resource'

export class ELB implements Resource {

  cluster:Cluster

  constructor(cluster: Cluster) {
    this.cluster = cluster;
  }

  resources() {
    return {
      'ContainerlessELB': {
        'Type': 'AWS::ElasticLoadBalancingV2::LoadBalancer',
        'Properties': {
          'Scheme': 'internet-facing',
          'LoadBalancerAttributes': [
            {
              'Key': 'idle_timeout.timeout_seconds',
              'Value': 30
            }
          ],
          'Subnets': this.cluster.subnets,
          'SecurityGroups': [this.cluster.securityGroup]
        }
      },
      'ContainerlessListener': {
        'Type': 'AWS::ElasticLoadBalancingV2::Listener',
        "DependsOn": 'ContainerlessELB',
        'Properties': {
          'DefaultActions': [
            {
              'Type': 'forward',
              'TargetGroupArn': {
                'Ref': 'ContainerlessDefaultTargetGroup'
              }
            }
          ],
          'LoadBalancerArn': {
            'Ref': 'ContainerlessELB'
          },
          'Port': '80',
          'Protocol': 'HTTP'
        }
      },
      'ContainerlessDefaultTargetGroup': {
        'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
        'DependsOn': 'ContainerlessELB',
        'Properties': {
          'Port': 80,
          'Protocol': 'HTTP',
          'VpcId': this.cluster.vpcId
        }
      }
    }
  }
}
