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
        var definition = {
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
                    'Certificates': [],
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
                    'Port': this.cluster.port,
                    'Protocol': this.cluster.protocol
                }
            },
            'ContainerlessDefaultTargetGroup': {
                'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
                'DependsOn': 'ContainerlessELB',
                'Properties': {
                    'Port': this.cluster.port,
                    'Protocol': this.cluster.protocol,
                    'VpcId': this.cluster.vpcId
                }
            }
        };
        if (this.cluster.certificate) {
            definition.ContainerlessListener.Properties.Certificates = [{ 'CertificateArn': this.cluster.certificate }];
        }
        return definition;
    };
    return ELB;
}());
exports.ELB = ELB;
