import { Resource } from './resource';
export declare class Cluster implements Resource {
    amiIds: any;
    subnets: string;
    vpcId: string;
    certificate: string;
    protocol: Array<string>;
    private _id;
    private _securityGroup;
    private capacity;
    private instance_type;
    private key_name;
    private max_size;
    private min_size;
    private region;
    private size;
    private max_memory_threshold;
    constructor(opts: any);
    readonly defaultListenerName: string;
    readonly defaultTargetGroupName: string;
    requireVpcId(): void;
    requireCertificate(): void;
    requireSubnets(): void;
    requireSecurityGroup(): void;
    ami(): any;
    readonly name: string;
    readonly id: string | {
        'Ref': string;
    };
    readonly securityGroup: string | {
        'Ref': string;
    };
    readonly elbRole: {
        'Ref': string;
    };
    generate(): {} | {
        'ClsInstanceProfile': {
            'Type': string;
            'Properties': {
                'Path': string;
                'Roles': {
                    'Ref': string;
                }[];
            };
        };
        'ClsCluster': {
            'Type': string;
            'DependsOn': string;
        };
        'ClsLaunchConfiguration': {
            'Type': string;
            'DependsOn': string[];
            'Properties': {
                'AssociatePublicIpAddress': boolean;
                'IamInstanceProfile': {
                    'Ref': string;
                };
                'ImageId': any;
                'InstanceType': string;
                'KeyName': string;
                'SecurityGroups': {
                    'Ref': string;
                }[];
                'UserData': {
                    'Fn::Base64': {
                        'Fn::Sub': string;
                    };
                };
            };
        };
        'ClsInstanceRole': {
            'Type': string;
            'Properties': {
                'AssumeRolePolicyDocument': {
                    'Statement': {
                        'Action': string[];
                        'Effect': string;
                        'Principal': {
                            'Service': string[];
                        };
                    }[];
                };
                'Path': string;
                'Policies': {
                    'PolicyDocument': {
                        'Statement': {
                            'Action': string[];
                            'Effect': string;
                            'Resource': string;
                        }[];
                    };
                    'PolicyName': string;
                }[];
            };
        };
        'ClsSecurityGroup': {
            'Properties': {
                'GroupDescription': string;
                'VpcId': string;
            };
            'Type': string;
        };
        'ClsSecurityGroupDynamicPorts': {
            'Type': string;
            'Properties': {
                'IpProtocol': string;
                'FromPort': number;
                'ToPort': number;
                'GroupId': {
                    'Ref': string;
                };
                'SourceSecurityGroupId': {
                    'Ref': string;
                };
            };
        };
        'ClsSecurityGroupHTTP': {
            'Type': string;
            'Properties': {
                'CidrIp': string;
                'IpProtocol': string;
                'FromPort': string;
                'ToPort': string;
                'GroupId': {
                    'Ref': string;
                };
            };
        };
        'ClsSecurityGroupHTTPS': {
            'Type': string;
            'Properties': {
                'CidrIp': string;
                'IpProtocol': string;
                'FromPort': string;
                'ToPort': string;
                'GroupId': {
                    'Ref': string;
                };
            };
        };
        'ClsELBRole': {
            'Type': string;
            'Properties': {
                'AssumeRolePolicyDocument': {
                    'Statement': {
                        'Effect': string;
                        'Principal': {
                            'Service': string[];
                        };
                        'Action': string[];
                    }[];
                };
                'Path': string;
                'Policies': {
                    'PolicyName': string;
                    'PolicyDocument': {
                        'Statement': {
                            'Effect': string;
                            'Resource': string;
                            'Action': string[];
                        }[];
                    };
                }[];
            };
        };
        'ContainerlessASGRole': {
            "Type": string;
            "Properties": {
                "AssumeRolePolicyDocument": {
                    "Statement": {
                        "Effect": string;
                        "Principal": {
                            "Service": string[];
                        };
                        "Action": string[];
                    }[];
                };
                "Path": string;
                "Policies": {
                    "PolicyName": string;
                    "PolicyDocument": {
                        "Statement": {
                            "Effect": string;
                            "Action": string[];
                            "Resource": string;
                        }[];
                    };
                }[];
            };
        };
        'ClsAutoScalingGroup': {
            'Type': string;
            'CreationPolicy': {
                'ResourceSignal': {
                    'Timeout': string;
                };
            };
            'UpdatePolicy': {
                'AutoScalingReplacingUpdate': {
                    'WillReplace': string;
                };
                'AutoScalingRollingUpdate': {
                    'MinInstancesInService': number;
                    'MaxBatchSize': number;
                    'PauseTime': string;
                    'WaitOnResourceSignals': string;
                };
            };
            'Properties': {
                'DesiredCapacity': number;
                'LaunchConfigurationName': {
                    'Ref': string;
                };
                'MaxSize': number;
                'MinSize': number;
                'VPCZoneIdentifier': string;
            };
        };
        'MemoryReservationScaleUpPolicy': {
            'Type': string;
            'Properties': {
                'AdjustmentType': string;
                'AutoScalingGroupName': {
                    'Ref': string;
                };
                'Cooldown': string;
                'ScalingAdjustment': string;
            };
        };
        'MemoryReservationHighAlert': {
            'Type': string;
            'Properties': {
                'EvaluationPeriods': string;
                'Statistic': string;
                'Threshold': number;
                'AlarmDescription': string;
                'Period': string;
                'AlarmActions': {
                    'Ref': string;
                }[];
                'Namespace': string;
                'Dimensions': {
                    'Name': string;
                    'Value': {
                        'Ref': string;
                    };
                }[];
                'ComparisonOperator': string;
                'MetricName': string;
            };
        };
    };
}
