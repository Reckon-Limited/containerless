"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var ELB = (function () {
    function ELB(cluster) {
        this.PORTS = {
            'HTTP': 80,
            'HTTPS': 443,
        };
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
        var _this = this;
        var definition = {
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
        var listeners = _.map(this.cluster.protocol, function (protocol) {
            return _this.generateListener(protocol);
        });
        return _.assign.apply(_, [definition].concat(listeners));
    };
    ELB.prototype.generateListener = function (protocol) {
        var definition = (_a = {},
            _a["Cls" + protocol + "Listener"] = {
                'Type': 'AWS::ElasticLoadBalancingV2::Listener',
                "DependsOn": 'ClsELB',
                'Properties': {
                    'Certificates': [],
                    'DefaultActions': [
                        {
                            'Type': 'forward',
                            'TargetGroupArn': {
                                'Ref': "Cls" + protocol + "TargetGroup"
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
            _a["Cls" + protocol + "TargetGroup"] = {
                'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
                'DependsOn': 'ClsELB',
                'Properties': {
                    'Port': this.PORTS[protocol],
                    'Protocol': protocol,
                    'VpcId': this.cluster.vpcId
                }
            },
            _a);
        if (protocol == 'HTTPS') {
            definition["Cls" + protocol + "Listener"].Properties.Certificates = [{ 'CertificateArn': this.cluster.certificate }];
        }
        return definition;
        var _a;
    };
    return ELB;
}());
exports.ELB = ELB;
