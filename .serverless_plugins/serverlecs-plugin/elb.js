"use strict";
var ELB = (function () {
    function ELB(opts) {
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
    Object.defineProperty(ELB.prototype, "name", {
        get: function () {
            return "ContainerlessELB";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ELB.prototype, "roleName", {
        get: function () {
            return "ContainerlessELBRole";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ELB.prototype, "listenerName", {
        get: function () {
            return "ContainerlessListener";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ELB.prototype, "targetGroupName", {
        get: function () {
            return "ContainerlessDefaultTargetGroup";
        },
        enumerable: true,
        configurable: true
    });
    ELB.prototype.generateResources = function () {
        var resources = {};
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
        };
        resources[this.listenerName] = {
            'Type': 'AWS::ElasticLoadBalancingV2::Listener',
            'DependsOn': this.roleName,
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
        };
        resources[this.targetGroupName] = {
            'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
            'DependsOn': this.name,
            'Properties': {
                'Port': 80,
                'Protocol': 'HTTP',
                'VpcId': this.opts.vpcId
            }
        };
        return resources;
    };
    ELB.prototype.rolePolicy = function () {
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
        };
    };
    Object.defineProperty(ELB.prototype, "securityGroupName", {
        get: function () {
            return "ContainerlessSecurityGroup";
        },
        enumerable: true,
        configurable: true
    });
    ELB.prototype.securityGroup = function () {
        var resources = {};
        resources[this.securityGroupName] = {
            'Type': 'AWS::EC2::SecurityGroup',
            'Properties': {
                'VpcId': {
                    'Ref': this.opts.vpcId
                }
            }
        };
        resources['DynamicPorts'] = {
            'Type': 'AWS::EC2::SecurityGroupIngress',
            'Properties': {
                'GroupId': {
                    'Ref': this.securityGroupName
                },
                'IpProtocol': 'tcp',
                'FromPort': 31000,
                'ToPort': 61000,
                'SourceSecurityGroupId': {}
            }
        };
        resources['HTTP'] = {
            'Type': 'AWS::EC2::SecurityGroupIngress',
            'Properties': {
                'GroupId': {
                    'Ref': this.securityGroupName
                },
                'IpProtocol': 'tcp',
                'FromPort': '80',
                'ToPort': '80',
                'CidrIp': '0.0.0.0/0'
            }
        };
        resources['HTTPS'] = {
            'Type': 'AWS::EC2::SecurityGroupIngress',
            'Properties': {
                'GroupId': {
                    'Ref': this.securityGroupName
                },
                'IpProtocol': 'tcp',
                'FromPort': '443',
                'ToPort': '443',
                'CidrIp': '0.0.0.0/0'
            }
        };
        return resources;
    };
    return ELB;
}());
exports.ELB = ELB;
