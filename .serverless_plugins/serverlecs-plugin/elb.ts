import * as _ from 'lodash';

export interface ELBOpts {
  vpcId: string
  subnets: Array<string>
}

export class ELB {
  service: any
  opts: ELBOpts

  constructor(service: any) {
    this.service = service;
    this.opts = this.service.loadBalancer;

    if (!this.service.loadBalancer) {
      throw new TypeError('Service must define a Load Balancer');
    }

    if (!this.opts.vpcId) {
       throw new TypeError('Load Balancer must define a VPC Id');
    }

    if (!this.opts.subnets) {
       throw new TypeError('Load Balancer must define at least one subnet');
    }
  }

  get name() {
    return `${this.service.name}ELB`;
  }

  get elbRoleName() {
    return `${this.service.name}ELBRole`;
  }

  get elbListenerName() {
    return `${this.service.name}HTTPListener`;
  }

  get elbTargetGroupName() {
    return `${this.service.name}TargetGroup`;
  }

  get elbSecurityGroup() {
    return `${this.service.name}SecurityGroup`;
  }

  generateResources() {
    let resources:any = {}

    resources[this.elbRoleName] = {
      'Type': 'AWS::IAM::Role',
      'Properties': {
        'AssumeRolePolicyDocument': {
          'Statement': [
            {
              'Effect': 'Allow',
              'Principal': {
                'Service': [
                  'ecs.amazonaws.com'
                ]
              },
              'Action': [
                'sts:AssumeRole'
              ]
            }
          ]
        },
        'Path': '/',
        'Policies': [
          {
            'PolicyName': 'elb-role-policy',
            'PolicyDocument': {
              'Statement': [
                {
                  'Effect': 'Allow',
                  'Resource': '*',
                  'Action': [
                    'elasticloadbalancing:DeregisterInstancesFromLoadBalancer',
                    'elasticloadbalancing:DeregisterTargets',
                    'elasticloadbalancing:Describe*',
                    'elasticloadbalancing:RegisterInstancesWithLoadBalancer',
                    'elasticloadbalancing:RegisterTargets',
                    'ec2:Describe*',
                    'ec2:AuthorizeSecurityGroupIngress'
                  ]
                }
              ]
            }
          }
        ]
      }
    }

    resources[this.name] = {
      'Type': 'AWS::ElasticLoadBalancingV2::LoadBalancer',
      'Properties': {
        'Scheme': 'internet-facing',
        'LoadBalancerAttributes': [
          {
            'Key': 'idle_timeout.timeout_seconds',
            'Value': 30
          }
        ],
        'Subnets': this.opts.subnets,
        'SecurityGroups': [
          {
            'Ref': this.elbSecurityGroup
          }
        ]
      }
    }

    resources[this.elbSecurityGroup] = {
       'Type': 'AWS::EC2::SecurityGroup',
       'Properties': {
         'VpcId': {
           'Ref': this.opts.vpcId
         }
       }
    }

    resources['DynamicPorts'] = {
      'Type': 'AWS::EC2::SecurityGroupIngress',
      'Properties': {
         'GroupId': {
           'Ref': this.elbSecurityGroup
         },
         'IpProtocol': 'tcp',
         'FromPort': 31000,
         'ToPort': 61000,
         'SourceSecurityGroupId': {
           'Ref': this.service.securityGroupId
         }
      }
    }

    resources['HTTP'] = {
      'Type': 'AWS::EC2::SecurityGroupIngress',
      'Properties': {
        'GroupId': {
          'Ref': this.elbSecurityGroup
        },
        'IpProtocol': 'tcp',
        'FromPort': '80',
        'ToPort': '80',
        'CidrIp': '0.0.0.0/0'
      }
    }

    resources['HTTPS'] = {
      'Type': 'AWS::EC2::SecurityGroupIngress',
      'Properties': {
        'GroupId': {
          'Ref': this.elbSecurityGroup
        },
        'IpProtocol': 'tcp',
        'FromPort': '443',
        'ToPort': '443',
        'CidrIp': '0.0.0.0/0'
      }
    }

    resources[this.elbListenerName] = {
      'Type': 'AWS::ElasticLoadBalancingV2::Listener',
      'DependsOn': 'ELBServiceRole',
      'Properties': {
        'DefaultActions': [
          {
            'Type': 'forward',
            'TargetGroupArn': {
              'Ref': 'ELBTargetGroup'
            }
          }
        ],
        'LoadBalancerArn': {
          'Ref': 'ELB'
        },
        'Port': '80',
        'Protocol': 'HTTP'
      }
    }

    resources[this.elbTargetGroupName] = {
      'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
      'DependsOn': 'ELB',
      'Properties': {
        'HealthCheckIntervalSeconds': 10,
        'HealthCheckPath': '/',
        'HealthCheckProtocol': 'HTTP',
        'HealthCheckTimeoutSeconds': 5,
        'HealthyThresholdCount': 2,
        'Port': 80,
        'Protocol': 'HTTP',
        'UnhealthyThresholdCount': 2,
        'VpcId': this.opts.vpcId
      }
    }

    return resources;
  }
}
