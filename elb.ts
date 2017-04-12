import _ = require('lodash');

import { Cluster } from './cluster'
import { Resource } from './resource'

export class ELB implements Resource {

  cluster: Cluster

  constructor(cluster: Cluster) {
    this.cluster = cluster;
  }

  get name() {
    return 'ELB';
  }

  generate() {
    let definition:any = {
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
          'Certificates': [],
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
          'Port': this.cluster.port,
          'Protocol': this.cluster.protocol
        }
      },
      'ContainerlessDefaultTargetGroup': {
        'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
        'DependsOn': 'ContainerlessELB',
        'Properties': {
          'Port': this.cluster.port,
          'Protocol': this.cluster.protocol,
          'VpcId': this.cluster.vpcId
        }
      }
    }

    if (this.cluster.certificate) {
      definition.ContainerlessListener.Properties.Certificates = [{'CertificateArn': this.cluster.certificate}]
    }

    return definition;
  }
}
