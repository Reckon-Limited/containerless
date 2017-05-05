import _ = require('lodash');

import { Cluster } from './cluster'
import { Resource } from './resource'

export class ELB implements Resource {

  cluster: Cluster

  private PORTS: { [protocol: string]: number; }  = {
    'HTTP': 80,
    'HTTPS': 443,
  }

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
      }
    }

    let listeners:Array<any> =  _.map(this.cluster.protocol, (protocol) => {
      return this.generateListener(protocol)
    })

    return Object.assign(definition, ...listeners);
  }

  generateListener(protocol: string) {
    let definition:any = {
      [`Containerless${protocol}Listener`]: {
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
          'Port': this.PORTS[protocol],
          'Protocol': protocol
        }
      },
      [`Containerless${protocol}TargetGroup`]: {
        'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
        'DependsOn': 'ContainerlessELB',
        'Properties': {
          'Port': this.PORTS[protocol],
          'Protocol': protocol,
          'VpcId': this.cluster.vpcId
        }
      }
    }

    if (protocol == 'HTTPS') {
      definition[`Containerless${protocol}Listener`].Properties.Certificates = [{'CertificateArn': this.cluster.certificate}]
    }
    console.log(definition);
    return definition;
  }



}
