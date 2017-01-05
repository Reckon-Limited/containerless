import { Resource } from './resource';
export declare class Cluster implements Resource {
    amiIds: any;
    subnets: string;
    vpcId: string;
    private _id;
    private _securityGroup;
    private capacity;
    private instance_type;
    private region;
    private size;
    constructor(opts: any);
    requireVpcId(): void;
    requireSubnets(): void;
    requireSecurityGroup(): void;
    ami(): any;
    readonly id: string | {
        'Ref': string;
    };
    readonly securityGroup: string | {
        'Ref': string;
    };
    readonly elbRole: {
        'Ref': string;
    };
    resources(): {} | {
        'AutoScalingGroup': {
            'CreationPolicy': {
                'ResourceSignal': {
                    'Timeout': string;
                };
            };
            'Properties': {
                'DesiredCapacity': number;
                'LaunchConfigurationName': {
                    'Ref': string;
                };
                'MaxSize': number;
                'MinSize': string;
                'VPCZoneIdentifier': string;
            };
        };
        'ContainerlessInstanceProfile': {
            'Type': string;
            'Properties': {
                'Path': string;
                'Roles': {
                    'Ref': string;
                }[];
            };
        };
        'ContainerlessCluster': {
            'Type': string;
            'Properties': {
                'Name': string;
            };
        };
        'ContainerlessLaunchConfiguration': {
            'Type': string;
            'DependsOn': string[];
            'Properties': {
                'AssociatePublicIpAddress': boolean;
                'IamInstanceProfile': {
                    'Ref': string;
                };
                'ImageId': any;
                'InstanceType': {
                    'Ref': string;
                };
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
        'ContainerlessInstanceRole': {
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
        'ContainerlessSecurityGroup': {
            'Properties': {
                'GroupDescription': string;
                'VpcId': string;
            };
            'Type': string;
        };
        'ContainerlessSecurityGroupDynamicPorts': {
            'Type': string;
            'Properties': {
                'FromPort': number;
                'GroupId': {
                    'Ref': string;
                };
                'IpProtocol': string;
                'SourceSecurityGroupId': {
                    'Ref': string;
                };
                'ToPort': number;
            };
        };
        'ContainerlessSecurityGroupHTTP': {
            'Type': string;
            'Properties': {
                'CidrIp': string;
                'FromPort': string;
                'GroupId': {
                    'Ref': string;
                };
                'IpProtocol': string;
                'ToPort': string;
            };
        };
        'ContainerlessSecurityGroupHTTPS': {
            'Type': string;
            'Properties': {
                'CidrIp': string;
                'FromPort': string;
                'GroupId': {
                    'Ref': string;
                };
                'IpProtocol': string;
                'ToPort': string;
            };
        };
        'ContainerlessELBRole': {
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
    };
}
