"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var Cluster = (function () {
    function Cluster(opts, clusterName) {
        // http://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-optimized_AMI_launch_latest.html
        this.amiIds = {
            'us-east-1': 'ami-275ffe31',
            'us-east-2': 'ami-62745007',
            'us-west-1': 'ami-689bc208',
            'us-west-2': 'ami-62d35c02',
            'eu-west-1': 'ami-95f8d2f3',
            'eu-west-2': 'ami-bf9481db',
            'eu-central-1': 'ami-085e8a67',
            'ap-northeast-1': 'ami-f63f6f91',
            'ap-southeast-1': 'ami-b4ae1dd7',
            'ap-southeast-2': 'ami-fbe9eb98',
            'ca-central-1': 'ami-ee58e58a'
        };
        if (opts.id) {
            this._id = opts.id;
            this._securityGroup = opts.security_group || this.requireSecurityGroup();
        }
        else {
            this.capacity = opts.capacity || 1;
            this.instance_type = opts.instance_type || 't2.micro';
            this.key_name = opts.key_name || 'ecs-instance';
            this.region = opts.region || 'ap-southeast-2';
            this.size = opts.size || 1;
            this.max_size = opts.max_size || this.size + 1;
            this.min_size = opts.min_size || 1;
            this.max_memory_threshold = opts.max_memory_threshold || 80;
        }
        // we always need a vpc and at least one subnet
        this.vpcId = opts.vpcId || this.requireVpcId();
        this.subnets = opts.subnets || this.requireSubnets();
        this.protocol = _.castArray(opts.protocol) || ['HTTP'];
        this.certificate = opts.certificate;
        this.name = clusterName;
        if (!this.certificate && _.includes(this.protocol, 'HTTPS')) {
            this.requireCertificate();
        }
    }
    Object.defineProperty(Cluster.prototype, "defaultListenerName", {
        get: function () {
            var protocol = _.first(this.protocol);
            return "Cls" + protocol + "Listener";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cluster.prototype, "defaultTargetGroupName", {
        get: function () {
            var protocol = _.first(this.protocol);
            return "Cls" + protocol + "TargetGroup";
        },
        enumerable: true,
        configurable: true
    });
    Cluster.prototype.requireVpcId = function () {
        throw new TypeError('Cluster requires a VPC Id');
    };
    Cluster.prototype.requireCertificate = function () {
        throw new TypeError('Cluster requires a Certificate ARN for HTTPS');
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
    Object.defineProperty(Cluster.prototype, "clusterName", {
        get: function () {
            return this.name;
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
                return { 'Ref': 'ClsCluster' };
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
                return { 'Ref': 'ClsSecurityGroup' };
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cluster.prototype, "elbRole", {
        get: function () {
            return { 'Ref': 'ClsELBRole' };
        },
        enumerable: true,
        configurable: true
    });
    Cluster.prototype.generate = function () {
        if (this._id)
            return {};
        return {
            'ClsInstanceProfile': {
                'Type': 'AWS::IAM::InstanceProfile',
                'Properties': {
                    'Path': '/',
                    'Roles': [
                        { 'Ref': 'ClsInstanceRole' }
                    ]
                }
            },
            'ClsCluster': {
                'Type': 'AWS::ECS::Cluster',
                'DependsOn': 'ClsELBRole'
            },
            'ClsLaunchConfiguration': {
                'Type': 'AWS::AutoScaling::LaunchConfiguration',
                'DependsOn': ['ClsInstanceProfile', 'ClsSecurityGroup'],
                'Properties': {
                    'AssociatePublicIpAddress': true,
                    'IamInstanceProfile': {
                        'Ref': 'ClsInstanceProfile'
                    },
                    'ImageId': this.ami(),
                    'InstanceType': this.instance_type,
                    'KeyName': this.key_name,
                    'SecurityGroups': [
                        {
                            'Ref': 'ClsSecurityGroup'
                        }
                    ],
                    'UserData': {
                        'Fn::Base64': {
                            'Fn::Sub': '#!/bin/bash -xe\nyum install -y aws-cfn-bootstrap\necho ECS_CLUSTER=${ClsCluster} >> /etc/ecs/ecs.config\n\n# /opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --region ${AWS::Region}\n\n/opt/aws/bin/cfn-signal -e 0 --stack ${AWS::StackName} --resource ClsAutoScalingGroup --region ${AWS::Region}\n'
                        }
                    }
                }
            },
            'ClsInstanceRole': {
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
            'ClsSecurityGroup': {
                'Properties': {
                    'GroupDescription': 'ECS Public Security Group',
                    'VpcId': this.vpcId
                },
                'Type': 'AWS::EC2::SecurityGroup'
            },
            'ClsSecurityGroupDynamicPorts': {
                'Type': 'AWS::EC2::SecurityGroupIngress',
                'Properties': {
                    'IpProtocol': 'tcp',
                    'FromPort': 31000,
                    'ToPort': 61000,
                    'GroupId': {
                        'Ref': 'ClsSecurityGroup'
                    },
                    'SourceSecurityGroupId': {
                        'Ref': 'ClsSecurityGroup'
                    }
                }
            },
            'ClsSecurityGroupHTTP': {
                'Type': 'AWS::EC2::SecurityGroupIngress',
                'Properties': {
                    'CidrIp': '0.0.0.0/0',
                    'IpProtocol': 'tcp',
                    'FromPort': '80',
                    'ToPort': '80',
                    'GroupId': {
                        'Ref': 'ClsSecurityGroup'
                    }
                },
            },
            'ClsSecurityGroupHTTPS': {
                'Type': 'AWS::EC2::SecurityGroupIngress',
                'Properties': {
                    'CidrIp': '0.0.0.0/0',
                    'IpProtocol': 'tcp',
                    'FromPort': '443',
                    'ToPort': '443',
                    'GroupId': {
                        'Ref': 'ClsSecurityGroup'
                    }
                }
            },
            'ClsELBRole': {
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
            },
            'ContainerlessASGRole': {
                "Type": "AWS::IAM::Role",
                "Properties": {
                    "AssumeRolePolicyDocument": {
                        "Statement": [
                            {
                                "Effect": "Allow",
                                "Principal": {
                                    "Service": [
                                        "application-autoscaling.amazonaws.com"
                                    ]
                                },
                                "Action": [
                                    "sts:AssumeRole"
                                ]
                            }
                        ]
                    },
                    "Path": "/",
                    "Policies": [
                        {
                            "PolicyName": "service-autoscaling",
                            "PolicyDocument": {
                                "Statement": [
                                    {
                                        "Effect": "Allow",
                                        "Action": [
                                            "application-autoscaling:*",
                                            "cloudwatch:DescribeAlarms",
                                            "cloudwatch:PutMetricAlarm",
                                            "ecs:DescribeServices",
                                            "ecs:UpdateService"
                                        ],
                                        "Resource": "*"
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            'ClsAutoScalingGroup': {
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
                        'MaxBatchSize': 1,
                        'PauseTime': 'PT15M',
                        'WaitOnResourceSignals': 'true'
                    }
                },
                'Properties': {
                    'DesiredCapacity': this.capacity,
                    'LaunchConfigurationName': {
                        'Ref': 'ClsLaunchConfiguration'
                    },
                    'MaxSize': this.max_size,
                    'MinSize': this.min_size,
                    'VPCZoneIdentifier': this.subnets,
                    'Tags': [
                        {
                            'Key': 'Origin',
                            'Value': 'Containerless',
                            'PropagateAtLaunch': true
                        }, {
                            'Key': 'Name',
                            'Value': this.clusterName,
                            'PropagateAtLaunch': true
                        }
                    ]
                }
            },
            'MemoryReservationScaleUpPolicy': {
                'Type': 'AWS::AutoScaling::ScalingPolicy',
                'Properties': {
                    'AdjustmentType': 'PercentChangeInCapacity',
                    'AutoScalingGroupName': {
                        'Ref': 'ClsAutoScalingGroup'
                    },
                    'Cooldown': '300',
                    'ScalingAdjustment': '30'
                }
            },
            'MemoryReservationHighAlert': {
                'Type': 'AWS::CloudWatch::Alarm',
                'Properties': {
                    'EvaluationPeriods': '1',
                    'Statistic': 'Maximum',
                    'Threshold': this.max_memory_threshold,
                    'AlarmDescription': 'Alarm if CPU too high or metric disappears indicating instance is down',
                    'Period': '60',
                    'AlarmActions': [
                        { 'Ref': 'MemoryReservationScaleUpPolicy' }
                    ],
                    'Namespace': 'AWS/ECS',
                    'Dimensions': [
                        {
                            'Name': 'ClusterName',
                            'Value': {
                                'Ref': 'ClsCluster'
                            }
                        }
                    ],
                    'ComparisonOperator': 'GreaterThanThreshold',
                    'MetricName': 'MemoryReservation'
                }
            }
        };
    };
    return Cluster;
}());
exports.Cluster = Cluster;
