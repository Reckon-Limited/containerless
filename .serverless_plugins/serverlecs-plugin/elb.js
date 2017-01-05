"use strict";
var ELB = (function () {
    function ELB(cluster) {
        this.cluster = cluster;
    }
    Object.defineProperty(ELB.prototype, "name", {
        get: function () {
            return 'ELB';
        },
        enumerable: true,
        configurable: true
    });
    ELB.prototype.generate = function () {
        return {
            'ContainerlessELB': {
                'Type': 'AWS::ElasticLoadBalancingV2::LoadBalancer',
                'Properties': {
                    'Scheme': 'internet-facing',
                    'LoadBalancerAttributes': [
                        {
                            'Key': 'idle_timeout.timeout_seconds',
                            'Value': 30
                        }
                    ],
                    'Subnets': this.cluster.subnets,
                    'SecurityGroups': [this.cluster.securityGroup]
                }
            },
            'ContainerlessListener': {
                'Type': 'AWS::ElasticLoadBalancingV2::Listener',
                "DependsOn": 'ContainerlessELB',
                'Properties': {
                    'DefaultActions': [
                        {
                            'Type': 'forward',
                            'TargetGroupArn': {
                                'Ref': 'ContainerlessDefaultTargetGroup'
                            }
                        }
                    ],
                    'LoadBalancerArn': {
                        'Ref': 'ContainerlessELB'
                    },
                    'Port': '80',
                    'Protocol': 'HTTP'
                }
            },
            'ContainerlessDefaultTargetGroup': {
                'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
                'DependsOn': 'ContainerlessELB',
                'Properties': {
                    'Port': 80,
                    'Protocol': 'HTTP',
                    'VpcId': this.cluster.vpcId
                }
            }
        };
    };
    return ELB;
}());
exports.ELB = ELB;
