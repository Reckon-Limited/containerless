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
            'ClsELB': {
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
            [`Cls${protocol}Listener`]: {
                'Type': 'AWS::ElasticLoadBalancingV2::Listener',
                "DependsOn": 'ClsELB',
                'Properties': {
                    'Certificates': [],
                    'DefaultActions': [
                        {
                            'Type': 'forward',
                            'TargetGroupArn': {
                                'Ref': `Cls${protocol}TargetGroup`
                            }
                        }
                    ],
                    'LoadBalancerArn': {
                        'Ref': 'ClsELB'
                    },
                    'Port': this.PORTS[protocol],
                    'Protocol': protocol
                }
            },
            [`Cls${protocol}TargetGroup`]: {
                'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
                'DependsOn': 'ClsELB',
                'Properties': {
                    'Port': this.PORTS[protocol],
                    'Protocol': protocol,
                    'VpcId': this.cluster.vpcId
                }
            }
        };
        if (protocol == 'HTTPS') {
            definition[`Cls${protocol}Listener`].Properties.Certificates = [{ 'CertificateArn': this.cluster.certificate }];
        }
        return definition;
    }
}
exports.ELB = ELB;
