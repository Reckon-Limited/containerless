import * as _ from 'lodash';

export class Listener {
  name: string
  vpcId: string
  port: number
  pathPattern: string
  priority: number

  constructor(name: string, opts:any) {
    this.name = name;
    this.vpcId = opts.load_balancer.vpcId;
    this.port = opts.port;
    this.pathPattern = opts.urlPath;
    this.priority = opts.priority;
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
            'Values' : [ this.pathPattern ]
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
        'VpcId': this.vpcId
      }
    }

    return resources;
  }

  mapping() {
    return [{
      'ContainerName': this.name,
      'ContainerPort': this.port,
      'TargetGroupArn': {
        'Ref': this.targetGroupName
      }
    }];

  }


}
