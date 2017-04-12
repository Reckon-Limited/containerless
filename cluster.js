"use strict";
var Cluster = (function () {
    function Cluster(opts) {
        // http://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-optimized_AMI_launch_latest.html
        this.amiIds = {
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
                    'MaxSize': this.size + 1,
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
