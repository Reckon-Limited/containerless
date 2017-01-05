"use strict";
var Cluster = (function () {
    function Cluster(opts) {
        this.amiIds = {
            'ap-northeast-1': 'ami-08f7956f',
            'ap-southeast-1': 'ami-f4832f97',
            'ap-southeast-2': 'ami-774b7314',
            'ca-central-1': 'ami-be45f7da',
            'eu-central-1': 'ami-e012d48f',
            'eu-west-1': 'ami-ba346ec9',
            'eu-west-2': 'ami-42c5cf26',
            'us-east-1': 'ami-6df8fe7a',
            'us-east-2': 'ami-c6b5efa3',
            'us-west-1': 'ami-1eda8d7e',
            'us-west-2': 'ami-a2ca61c2',
        };
        if (opts.id) {
            this._id = opts.id;
            this._securityGroup = opts.security_group || this.requireSecurityGroup();
        }
        else {
            this.capacity = opts.capacity || 1;
            this.instance_type = opts.instance_type || 't2.micro';
            this.region = opts.region || 'ap-southeast-2';
            this.size = opts.size || 1;
        }
        // we always need a vpc and at least one subnet
        this.vpcId = opts.vpcId || this.requireVpcId();
        this.subnets = opts.subnets || this.requireSubnets();
    }
    Cluster.prototype.requireVpcId = function () {
        throw new TypeError('Cluster requires a VPC Id');
    };
    Cluster.prototype.requireSubnets = function () {
        throw new TypeError('Cluster requires at least one Subnet Id');
    };
    Cluster.prototype.requireSecurityGroup = function () {
        throw new TypeError('Cluster requires a Security Group for mapping the Load Balancer');
    };
    Cluster.prototype.ami = function () {
        return this.amiIds[this.region];
    };
    Object.defineProperty(Cluster.prototype, "name", {
        get: function () {
            return 'Cluster';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cluster.prototype, "id", {
        get: function () {
            if (this._id) {
                return this._id;
            }
            else {
                return { 'Ref': 'ContainerlessCluster' };
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cluster.prototype, "securityGroup", {
        get: function () {
            if (this._securityGroup) {
                return this._securityGroup;
            }
            else {
                return { 'Ref': 'ContainerlessSecurityGroup' };
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cluster.prototype, "elbRole", {
        get: function () {
            return { 'Ref': 'ContainerlessELBRole' };
        },
        enumerable: true,
        configurable: true
    });
    Cluster.prototype.generate = function () {
        if (this._id)
            return {};
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
                        'PauseTime': 'PT5M',
                        'WillReplace': 'true'
                    }
                },
                'Properties': {
                    'DesiredCapacity': this.capacity,
                    'LaunchConfigurationName': {
                        'Ref': 'ContainerlessLaunchConfiguration'
                    },
                    'MaxSize': this.size,
                    'MinSize': '1',
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
                    'KeyName': 'ecs-instance',
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
        };
    };
    return Cluster;
}());
exports.Cluster = Cluster;
//     'AutoscalingRole': {
//       'Properties': {
//         'AssumeRolePolicyDocument': {
//           'Statement': [
//             {
//               'Action': [
//                 'sts:AssumeRole'
//               ],
//               'Effect': 'Allow',
//               'Principal': {
//                 'Service': [
//                   'application-autoscaling.amazonaws.com'
//                 ]
//               }
//             }
//           ]
//         },
//         'Path': '/',
//         'Policies': [
//           {
//             'PolicyDocument': {
//               'Statement': [
//                 {
//                   'Action': [
//                     'application-autoscaling:*',
//                     'cloudwatch:DescribeAlarms',
//                     'cloudwatch:PutMetricAlarm',
//                     'ecs:DescribeServices',
//                     'ecs:UpdateService'
//                   ],
//                   'Effect': 'Allow',
//                   'Resource': '*'
//                 }
//               ]
//             },
//             'PolicyName': 'ecs-service-autoscaling'
//           }
//         ]
//       },
//       'Type': 'AWS::IAM::Role'
//     },
