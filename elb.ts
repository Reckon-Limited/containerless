import * as _  from 'lodash';

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
      'ClsELB': {
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

    return _.assign(definition, ...listeners);
  }

  generateListener(protocol: string) {
    let definition:any = {
      [`Cls${protocol}Listener`]: {
        'Type': 'AWS::ElasticLoadBalancingV2::Listener',
        "DependsOn": 'ClsELB',
        'Properties': {
          'Certificates': [],
          'DefaultActions': [
            {
              'Type': 'forward',
              'TargetGroupArn': {
                'Ref': `Cls${protocol}TargetGroup`
              }
            }
          ],
          'LoadBalancerArn': {
            'Ref': 'ClsELB'
          },
          'Port': this.PORTS[protocol],
          'Protocol': protocol
        }
      },
      [`Cls${protocol}TargetGroup`]: {
        'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
        'DependsOn': 'ClsELB',
        'Properties': {
          'Port': this.PORTS[protocol],
          'Protocol': protocol,
          'VpcId': this.cluster.vpcId
        }
      }
    }

    if (protocol == 'HTTPS') {
      definition[`Cls${protocol}Listener`].Properties.Certificates = [{'CertificateArn': this.cluster.certificate}]
    }

    return definition;
  }



}
