import _ = require('lodash');

import { Resource } from './resource'

export class Cluster implements Resource {

  // http://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-optimized_AMI_launch_latest.html
  amiIds:any = {
    'us-east-1': 'ami-275ffe31',
    'us-east-2': 'ami-62745007',
    'us-west-1': 'ami-689bc208',
    'us-west-2': 'ami-62d35c02',
    'eu-west-1': 'ami-95f8d2f3',
    'eu-west-2': 'ami-bf9481db',
    'eu-central-1': 'ami-085e8a67',
    'ap-northeast-1': 'ami-f63f6f91ce',
    'ap-southeast-1': 'ami-b4ae1dd7ce',
    'ap-southeast-2': 'ami-fbe9eb98ce',
    'ca-central-1': 'ami-ee58e58a'
  }

  public subnets: string
  public vpcId: string
  public certificate: string
  public protocol: string
  public port: number

  private _id: string
  private _securityGroup: string

  private capacity: number
  private instance_type: string
  private key_name: string
  private max_size: number
  private min_size: number
  private region: string
  private size: number

  constructor(opts: any) {
    if (opts.id) {
      this._id = opts.id
      this._securityGroup = opts.security_group || this.requireSecurityGroup()
    } else {
      this.capacity = opts.capacity || 1
      this.instance_type = opts.instance_type || 't2.micro'
      this.key_name = opts.key_name || 'ecs-instance-key'
      this.region = opts.region || 'ap-southeast-2'
      this.size = opts.size || 1
      this.max_size = opts.max_size || this.size + 1
      this.min_size = opts.min_size || 1
    }
    // we always need a vpc and at least one subnet
    this.vpcId = opts.vpcId || this.requireVpcId()
    this.subnets = opts.subnets || this.requireSubnets()

    this.protocol = opts.protocol || 'HTTP'
    this.port = opts.port || this.setPort()
    this.certificate = opts.certificate

    if (!this.certificate && this.protocol == 'HTTPS') {
      this.requireCertificate()
    }
  }

  requireVpcId() {
    throw new TypeError('Cluster requires a VPC Id');
  }

  requireCertificate() {
    throw new TypeError('Cluster requires a Certificate ARN for HTTPS');
  }

  requireSubnets() {
    throw new TypeError('Cluster requires at least one Subnet Id');
  }

  requireSecurityGroup() {
    throw new TypeError('Cluster requires a Security Group for mapping the Load Balancer');
  }

  ami() {
    return this.amiIds[this.region];
  }

  setPort() {
    return (this.protocol == 'HTTPS') ? 443 : 80
  }

  get name() {
    return 'Cluster';
  }

  get id() {
    if (this._id) {
      return this._id;
    } else {
      return { 'Ref': 'ContainerlessCluster'}
    }
  }

  get securityGroup() {
    if (this._securityGroup) {
      return this._securityGroup;
    } else {
      return { 'Ref': 'ContainerlessSecurityGroup'}
    }
  }

  get elbRole() {
    return { 'Ref': 'ContainerlessELBRole'}
  }

  generate() {
    if (this._id) return {}

    return {
      'AutoScalingGroup': {
        'Type': 'AWS::AutoScaling::AutoScalingGroup',
        'CreationPolicy': {
          'ResourceSignal': {
            'Timeout': 'PT5M'
          }
        },
        'UpdatePolicy': {
          'AutoScalingReplacingUpdate': {
            'WillReplace': 'true'
          },
          'AutoScalingRollingUpdate': {
           'MinInstancesInService': 1,
           'MaxBatchSize': 1
         }
        },
        'Properties': {
          'DesiredCapacity': this.capacity,
          'LaunchConfigurationName': {
            'Ref': 'ContainerlessLaunchConfiguration'
          },
          'MaxSize': this.max_size,
          'MinSize': this.min_size,
          'VPCZoneIdentifier': this.subnets
        }
      },
      'ContainerlessInstanceProfile': {
        'Type': 'AWS::IAM::InstanceProfile',
        'Properties': {
          'Path': '/',
          'Roles': [
            { 'Ref': 'ContainerlessInstanceRole' }
          ]
        }
      },
      'ContainerlessCluster': {
        'Type': 'AWS::ECS::Cluster',
        'DependsOn': 'ContainerlessELBRole'
      },
      'ContainerlessLaunchConfiguration': {
        'Type': 'AWS::AutoScaling::LaunchConfiguration',
        'DependsOn': ['ContainerlessInstanceProfile', 'ContainerlessSecurityGroup'],
        'Properties': {
          'AssociatePublicIpAddress': true,
          'IamInstanceProfile': {
            'Ref': 'ContainerlessInstanceProfile'
          },
          'ImageId': this.ami(),
          'InstanceType': this.instance_type,
          'KeyName': this.key_name,
          'SecurityGroups': [
            {
              'Ref': 'ContainerlessSecurityGroup'
            }
          ],
          'UserData': {
            'Fn::Base64': {
              'Fn::Sub': '#!/bin/bash -xe\nyum install -y aws-cfn-bootstrap\n\n#!/bin/bash -xe\necho ECS_CLUSTER=${ContainerlessCluster} >> /etc/ecs/ecs.config\n\n# /opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource ECSAutoScalingLaunchConfig --region ${AWS::Region}\n\n/opt/aws/bin/cfn-signal -e 0 --stack ${AWS::StackName} --resource AutoScalingGroup --region ${AWS::Region}\n'
            }
          }
        }
      },
      'ContainerlessInstanceRole': {
        'Type': 'AWS::IAM::Role',
        'Properties': {
          'AssumeRolePolicyDocument': {
            'Statement': [
              {
                'Action': [
                  'sts:AssumeRole'
                ],
                'Effect': 'Allow',
                'Principal': {
                  'Service': [
                    'ec2.amazonaws.com'
                  ]
                }
              }
            ]
          },
          'Path': '/',
          'Policies': [
            {
              'PolicyDocument': {
                'Statement': [
                  {
                    'Action': [
                      'ecs:CreateCluster',
                      'ecs:DeregisterContainerInstance',
                      'ecs:DiscoverPollEndpoint',
                      'ecs:Poll',
                      'ecs:RegisterContainerInstance',
                      'ecs:StartTelemetrySession',
                      'ecs:Submit*',
                      'ecr:BatchCheckLayerAvailability',
                      'ecr:BatchGetImage',
                      'ecr:GetDownloadUrlForLayer',
                      'ecr:GetAuthorizationToken',
                      'logs:CreateLogStream',
                      'logs:PutLogEvents'
                    ],
                    'Effect': 'Allow',
                    'Resource': '*'
                  }
                ]
              },
              'PolicyName': 'ecs-service-instance'
            }
          ]
        },

      },
      'ContainerlessSecurityGroup': {
        'Properties': {
          'GroupDescription': 'ECS Public Security Group',
          'VpcId': this.vpcId
        },
        'Type': 'AWS::EC2::SecurityGroup'
      },
      'ContainerlessSecurityGroupDynamicPorts': {
        'Type': 'AWS::EC2::SecurityGroupIngress',
        'Properties': {
          'IpProtocol': 'tcp',
          'FromPort': 31000,
          'ToPort': 61000,
          'GroupId': {
            'Ref': 'ContainerlessSecurityGroup'
          },
          'SourceSecurityGroupId': {
            'Ref': 'ContainerlessSecurityGroup'
          }
        }
      },
      'ContainerlessSecurityGroupHTTP': {
        'Type': 'AWS::EC2::SecurityGroupIngress',
        'Properties': {
          'CidrIp': '0.0.0.0/0',
          'IpProtocol': 'tcp',
          'FromPort': '80',
          'ToPort': '80',
          'GroupId': {
            'Ref': 'ContainerlessSecurityGroup'
          }
        },
      },
      'ContainerlessSecurityGroupHTTPS': {
        'Type': 'AWS::EC2::SecurityGroupIngress',
        'Properties': {
          'CidrIp': '0.0.0.0/0',
          'IpProtocol': 'tcp',
          'FromPort': '443',
          'ToPort': '443',
          'GroupId': {
            'Ref': 'ContainerlessSecurityGroup'
          }
        }
      },
      'ContainerlessELBRole': {
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

}
