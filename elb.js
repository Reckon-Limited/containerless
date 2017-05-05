"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class ELB {
    constructor(cluster) {
        this.PORTS = {
            'HTTP': 80,
            'HTTPS': 443,
        };
        this.cluster = cluster;
    }
    get name() {
        return 'ELB';
    }
    generate() {
        let definition = {
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
            }
        };
        let listeners = _.map(this.cluster.protocol, (protocol) => {
            return this.generateListener(protocol);
        });
        return Object.assign(definition, ...listeners);
    }
    generateListener(protocol) {
        let definition = {
            [`Containerless${protocol}Listener`]: {
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
                    'Port': this.PORTS[protocol],
                    'Protocol': protocol
                }
            },
            [`Containerless${protocol}TargetGroup`]: {
                'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
                'DependsOn': 'ContainerlessELB',
                'Properties': {
                    'Port': this.PORTS[protocol],
                    'Protocol': protocol,
                    'VpcId': this.cluster.vpcId
                }
            }
        };
        if (protocol == 'HTTPS') {
            definition[`Containerless${protocol}Listener`].Properties.Certificates = [{ 'CertificateArn': this.cluster.certificate }];
        }
        console.log(definition);
        return definition;
    }
}
exports.ELB = ELB;
