import * as _ from 'lodash';

export class Listener {
  name: string
  vpcId: string
  port: number
  path: string

  constructor(name: string, vpcId: string, port: number, path: string) {
    this.name = name;
    this.vpcId = vpcId;
    this.port = port;
    this.path = path;
  }

  get listenerRuleName() {
    return `${this.name}ListenerRule`;
  }

  get targetGroupName() {
    return `${this.name}TargetGroup`;
  }

  generateResources() {
    let resources:any = {}

    resources[this.listenerRuleName] = {
      'Type' : 'AWS::ElasticLoadBalancingV2::ListenerRule',
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
            'Values' : [ this.path ]
          }
        ],
        'ListenerArn' : {'Ref': 'ContainerlessListener'},
        'Priority' : 1
      }
    }

    resources[this.targetGroupName] = {
      'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
      'DependsOn': this.name,
      'Properties': {
        'HealthCheckIntervalSeconds': 10,
        'HealthCheckPath': '/',
        'HealthCheckProtocol': 'HTTP',
        'HealthCheckTimeoutSeconds': 5,
        'HealthyThresholdCount': 2,
        'Port': 80,
        'Protocol': 'HTTP',
        'UnhealthyThresholdCount': 2,
        'VpcId': this.vpcId
      }
    }

    return resources;
  }

  mapping() {
    return {
      'ContainerName': this.name,
      'ContainerPort': this.port,
      'TargetGroupArn': {
        'Ref': this.targetGroupName
      }
    };

  }


}
