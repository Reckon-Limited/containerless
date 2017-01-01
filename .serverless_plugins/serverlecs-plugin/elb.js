"use strict";
var role = {
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
var elb = {
    'Type': 'AWS::ElasticLoadBalancingV2::LoadBalancer',
    'Properties': {
        'Scheme': 'internet-facing',
        'LoadBalancerAttributes': [
            {
                'Key': 'idle_timeout.timeout_seconds',
                'Value': 30
            }
        ],
        'Subnets': [],
        'SecurityGroups': [
            {
                'Ref': 'PublicSecurityGroup'
            }
        ]
    }
};
var ELB = (function () {
    function ELB(service) {
        this.service = service;
    }
    Object.defineProperty(ELB.prototype, "name", {
        get: function () {
            return this.service.name + "ELB";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ELB.prototype, "elbRoleName", {
        get: function () {
            return this.service.name + "ELBRole";
        },
        enumerable: true,
        configurable: true
    });
    ELB.prototype.generateResources = function () {
        var resources = {};
        resources[this.elbRoleName] = role;
        resources[this.name] = elb;
        return resources;
    };
    return ELB;
}());
exports.ELB = ELB;
