"use strict";
var Cluster = (function () {
    function Cluster(opts) {
        this.amiIds = {
            "ap-northeast-1": "ami-08f7956f",
            "ap-southeast-1": "ami-f4832f97",
            "ap-southeast-2": "ami-774b7314",
            "ca-central-1": "ami-be45f7da",
            "eu-central-1": "ami-e012d48f",
            "eu-west-1": "ami-ba346ec9",
            "eu-west-2": "ami-42c5cf26",
            "us-east-1": "ami-6df8fe7a",
            "us-east-2": "ami-c6b5efa3",
            "us-west-1": "ami-1eda8d7e",
            "us-west-2": "ami-a2ca61c2",
        };
        this.opts = opts;
    }
    Cluster.prototype.ami = function () {
        return this.amiIds[this.opts.region];
    };
    Cluster.prototype.generateResources = function () {
        return {
            "AutoScalingGroup": {
                "CreationPolicy": {
                    "ResourceSignal": {
                        "Timeout": "PT5M"
                    }
                },
                "Properties": {
                    "DesiredCapacity": this.capacity,
                    "LaunchConfigurationName": {
                        "Ref": "ContainerlessLaunchConfiguration"
                    },
                    "MaxSize": this.max_size,
                    "MinSize": "1",
                    "VPCZoneIdentifier": this.subnets
                }
            },
            "ContainerlessInstanceProfile": {
                "Type": "AWS::IAM::InstanceProfile",
                "Properties": {
                    "Path": "/",
                    "Roles": [
                        { "Ref": "ContainerlessInstanceRole" }
                    ]
                }
            },
            "ContainerlessCluster": {
                "Type": "AWS::ECS::Cluster",
                "Properties": {
                    "Name": "ContainerlessCluster",
                }
            },
            "ContainerlessLaunchConfiguration": {
                "Type": "AWS::AutoScaling::LaunchConfiguration",
                "DependsOn": ["ContainerlessInstanceProfile", "ContainerlessSecurityGroup"],
                "Properties": {
                    "AssociatePublicIpAddress": true,
                    "IamInstanceProfile": {
                        "Ref": "ContainerlessInstanceProfile"
                    },
                    "ImageId": this.ami(),
                    "InstanceType": {
                        "Ref": this.instance_type
                    },
                    "KeyName": "ecs-instance",
                    "SecurityGroups": [
                        {
                            "Ref": "ContainerlessSecurityGroup"
                        }
                    ],
                    "UserData": {
                        "Fn::Base64": {
                            "Fn::Sub": "#!/bin/bash -xe\nyum install -y aws-cfn-bootstrap\n\n#!/bin/bash -xe\necho ECS_CLUSTER=${ECSCluster} >> /etc/ecs/ecs.config\n\n# /opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource ECSAutoScalingLaunchConfig --region ${AWS::Region}\n\n/opt/aws/bin/cfn-signal -e 0 --stack ${AWS::StackName} --resource AutoScalingGroup --region ${AWS::Region}\n"
                        }
                    }
                }
            },
            "ContainerlessInstanceRole": {
                "Type": "AWS::IAM::Role",
                "Properties": {
                    "AssumeRolePolicyDocument": {
                        "Statement": [
                            {
                                "Action": [
                                    "sts:AssumeRole"
                                ],
                                "Effect": "Allow",
                                "Principal": {
                                    "Service": [
                                        "ec2.amazonaws.com"
                                    ]
                                }
                            }
                        ]
                    },
                    "Path": "/",
                    "Policies": [
                        {
                            "PolicyDocument": {
                                "Statement": [
                                    {
                                        "Action": [
                                            "ecs:CreateCluster",
                                            "ecs:DeregisterContainerInstance",
                                            "ecs:DiscoverPollEndpoint",
                                            "ecs:Poll",
                                            "ecs:RegisterContainerInstance",
                                            "ecs:StartTelemetrySession",
                                            "ecs:Submit*",
                                            "ecr:BatchCheckLayerAvailability",
                                            "ecr:BatchGetImage",
                                            "ecr:GetDownloadUrlForLayer",
                                            "ecr:GetAuthorizationToken",
                                            "logs:CreateLogStream",
                                            "logs:PutLogEvents"
                                        ],
                                        "Effect": "Allow",
                                        "Resource": "*"
                                    }
                                ]
                            },
                            "PolicyName": "ecs-service-instance"
                        }
                    ]
                },
            },
            "ContainerlessSecurityGroup": {
                "Properties": {
                    "GroupDescription": "ECS Public Security Group",
                    "VpcId": {
                        "Ref": "VPCId"
                    }
                },
                "Type": "AWS::EC2::SecurityGroup"
            },
            "ContainerlessSecurityGroupDynamicPorts": {
                "Type": "AWS::EC2::SecurityGroupIngress",
                "Properties": {
                    "FromPort": 31000,
                    "GroupId": {
                        "Ref": "ContainerlessSecurityGroup"
                    },
                    "IpProtocol": "tcp",
                    "SourceSecurityGroupId": {
                        "Ref": "ContainerlessSecurityGroup"
                    },
                    "ToPort": 61000
                }
            },
            "ContainerlessSecurityGroupHTTP": {
                "Type": "AWS::EC2::SecurityGroupIngress",
                "Properties": {
                    "CidrIp": "0.0.0.0/0",
                    "FromPort": "80",
                    "GroupId": {
                        "Ref": "ContainerlessSecurityGroup"
                    },
                    "IpProtocol": "tcp",
                    "ToPort": "80"
                },
            },
            "ContainerlessSecurityGroupHTTPS": {
                "Type": "AWS::EC2::SecurityGroupIngress",
                "Properties": {
                    "CidrIp": "0.0.0.0/0",
                    "FromPort": "443",
                    "GroupId": {
                        "Ref": "ContainerlessSecurityGroup"
                    },
                    "IpProtocol": "tcp",
                    "ToPort": "443"
                }
            }
        };
    };
    return Cluster;
}());
exports.Cluster = Cluster;
//     "AutoscalingRole": {
//       "Properties": {
//         "AssumeRolePolicyDocument": {
//           "Statement": [
//             {
//               "Action": [
//                 "sts:AssumeRole"
//               ],
//               "Effect": "Allow",
//               "Principal": {
//                 "Service": [
//                   "application-autoscaling.amazonaws.com"
//                 ]
//               }
//             }
//           ]
//         },
//         "Path": "/",
//         "Policies": [
//           {
//             "PolicyDocument": {
//               "Statement": [
//                 {
//                   "Action": [
//                     "application-autoscaling:*",
//                     "cloudwatch:DescribeAlarms",
//                     "cloudwatch:PutMetricAlarm",
//                     "ecs:DescribeServices",
//                     "ecs:UpdateService"
//                   ],
//                   "Effect": "Allow",
//                   "Resource": "*"
//                 }
//               ]
//             },
//             "PolicyName": "ecs-service-autoscaling"
//           }
//         ]
//       },
//       "Type": "AWS::IAM::Role"
//     },
