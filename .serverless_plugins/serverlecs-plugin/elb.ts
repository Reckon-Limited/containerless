import * as _ from 'lodash';

export interface ELBOpts {
  vpcId: string
  subnets: Array<string>
  security_group: string
}

export class ELB {
  opts: ELBOpts

  constructor(opts: any) {
    this.opts = opts;

    if (!this.opts.vpcId) {
       throw new TypeError('Load Balancer must define a VPC Id');
    }

    if (!this.opts.subnets) {
       throw new TypeError('Load Balancer must define at least one subnet');
    }

    if (!this.opts.security_group) {
       throw new TypeError('Load Balancer must define a security group');
    }
  }

  get name() {
    return `ContainerlessELB`;
  }

  get roleName() {
    return `ContainerlessELBRole`;
  }

  get listenerName() {
    return `ContainerlessListener`;
  }

  get targetGroupName() {
    return `ContainerlessDefaultTargetGroup`;
  }

  generateResources() {
    let resources:any = {}

    resources[this.roleName] = this.rolePolicy();

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
        'SecurityGroups': [this.opts.security_group]
      }
    }

    resources[this.listenerName] = {
      'Type': 'AWS::ElasticLoadBalancingV2::Listener',
      "DependsOn": this.name,
      'Properties': {
        'DefaultActions': [
          {
            'Type': 'forward',
            'TargetGroupArn': {
              'Ref': this.targetGroupName
            }
          }
        ],
        'LoadBalancerArn': {
          'Ref': this.name
        },
        'Port': '80',
        'Protocol': 'HTTP'
      }
    }

    resources[this.targetGroupName] = {
      'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
      'DependsOn': this.name,
      'Properties': {
        'Port': 80,
        'Protocol': 'HTTP',
        'VpcId': this.opts.vpcId
      }
    }

    return resources;
  }

  rolePolicy(): any {
    return {
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
  }

}
  // get securityGroupName() {
  //   return `ContainerlessSecurityGroup`;
  // }
  //
  // securityGroup(): any {
  //   let resources: any = {}
  //
  //   resources[this.securityGroupName] = {
  //      'Type': 'AWS::EC2::SecurityGroup',
  //      'Properties': {
  //        'VpcId': {
  //          'Ref': this.opts.vpcId
  //        }
  //      }
  //   }
  //
  //   resources['DynamicPorts'] = {
  //     'Type': 'AWS::EC2::SecurityGroupIngress',
  //     'Properties': {
  //        'GroupId': {
  //          'Ref': this.securityGroupName
  //        },
  //        'IpProtocol': 'tcp',
  //        'FromPort': 31000,
  //        'ToPort': 61000,
  //        'SourceSecurityGroupId': {
  //         //  'Ref': this.securityGroupId
  //        }
  //     }
  //   }
  //
  //   resources['HTTP'] = {
  //     'Type': 'AWS::EC2::SecurityGroupIngress',
  //     'Properties': {
  //       'GroupId': {
  //         'Ref': this.securityGroupName
  //       },
  //       'IpProtocol': 'tcp',
  //       'FromPort': '80',
  //       'ToPort': '80',
  //       'CidrIp': '0.0.0.0/0'
  //     }
  //   }
  //
  //   resources['HTTPS'] = {
  //     'Type': 'AWS::EC2::SecurityGroupIngress',
  //     'Properties': {
  //       'GroupId': {
  //         'Ref': this.securityGroupName
  //       },
  //       'IpProtocol': 'tcp',
  //       'FromPort': '443',
  //       'ToPort': '443',
  //       'CidrIp': '0.0.0.0/0'
  //     }
  //   }
  //
  //   return resources;
  // }
