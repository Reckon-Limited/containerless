export declare class Cluster {
    amiIds: {
        "ap-northeast-1": string;
        "ap-southeast-1": string;
        "ap-southeast-2": string;
        "ca-central-1": string;
        "eu-central-1": string;
        "eu-west-1": string;
        "eu-west-2": string;
        "us-east-1": string;
        "us-east-2": string;
        "us-west-1": string;
        "us-west-2": string;
    };
    capacity: number;
    max_size: number;
    vpcId: string;
    instance_type: string;
    opts: any;
    constructor(opts: any);
    ami(): any;
    generateResources(): {
        "AutoScalingGroup": {
            "CreationPolicy": {
                "ResourceSignal": {
                    "Timeout": string;
                };
            };
            "Properties": {
                "DesiredCapacity": number;
                "LaunchConfigurationName": {
                    "Ref": string;
                };
                "MaxSize": number;
                "MinSize": string;
                "VPCZoneIdentifier": any;
            };
        };
        "ContainerlessInstanceProfile": {
            "Type": string;
            "Properties": {
                "Path": string;
                "Roles": {
                    "Ref": string;
                }[];
            };
        };
        "ContainerlessCluster": {
            "Type": string;
            "Properties": {
                "Name": string;
            };
        };
        "ContainerlessLaunchConfiguration": {
            "Type": string;
            "DependsOn": string[];
            "Properties": {
                "AssociatePublicIpAddress": boolean;
                "IamInstanceProfile": {
                    "Ref": string;
                };
                "ImageId": any;
                "InstanceType": {
                    "Ref": string;
                };
                "KeyName": string;
                "SecurityGroups": {
                    "Ref": string;
                }[];
                "UserData": {
                    "Fn::Base64": {
                        "Fn::Sub": string;
                    };
                };
            };
        };
        "ContainerlessInstanceRole": {
            "Type": string;
            "Properties": {
                "AssumeRolePolicyDocument": {
                    "Statement": {
                        "Action": string[];
                        "Effect": string;
                        "Principal": {
                            "Service": string[];
                        };
                    }[];
                };
                "Path": string;
                "Policies": {
                    "PolicyDocument": {
                        "Statement": {
                            "Action": string[];
                            "Effect": string;
                            "Resource": string;
                        }[];
                    };
                    "PolicyName": string;
                }[];
            };
        };
        "ContainerlessSecurityGroup": {
            "Properties": {
                "GroupDescription": string;
                "VpcId": {
                    "Ref": string;
                };
            };
            "Type": string;
        };
        "ContainerlessSecurityGroupDynamicPorts": {
            "Type": string;
            "Properties": {
                "FromPort": number;
                "GroupId": {
                    "Ref": string;
                };
                "IpProtocol": string;
                "SourceSecurityGroupId": {
                    "Ref": string;
                };
                "ToPort": number;
            };
        };
        "ContainerlessSecurityGroupHTTP": {
            "Type": string;
            "Properties": {
                "CidrIp": string;
                "FromPort": string;
                "GroupId": {
                    "Ref": string;
                };
                "IpProtocol": string;
                "ToPort": string;
            };
        };
        "ContainerlessSecurityGroupHTTPS": {
            "Type": string;
            "Properties": {
                "CidrIp": string;
                "FromPort": string;
                "GroupId": {
                    "Ref": string;
                };
                "IpProtocol": string;
                "ToPort": string;
            };
        };
    };
}
