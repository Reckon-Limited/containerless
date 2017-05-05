"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
// this is a terrible idea
let priority = 0;
class Listener {
    constructor(service, cluster) {
        this.service = service;
        this.cluster = cluster;
        this.priority = this.calculatePriority();
    }
    calculatePriority() {
        return priority = priority + 1;
    }
    get name() {
        return `${this.service.name}Listener`;
    }
    required() {
        return (this.service.url && this.service.port);
    }
    generate() {
        if (!this.required())
            return [];
        return _.map(this.cluster.protocol, (protocol) => {
            return this.generateForProtocol(protocol);
        });
    }
    generateForProtocol(protocol) {
        let listenerRuleName = `${this.service.name}${protocol}Rule`;
        let targetGroupName = `${this.service.name}${protocol}Target`;
        let resources = {
            [listenerRuleName]: {
                'Type': 'AWS::ElasticLoadBalancingV2::ListenerRule',
                "DependsOn": [`Cls${protocol}Listener`, `Cls${protocol}TargetGroup`, targetGroupName],
                'Properties': {
                    'Actions': [
                        {
                            'TargetGroupArn': { 'Ref': targetGroupName },
                            'Type': 'forward'
                        }
                    ],
                    'Conditions': [
                        {
                            'Field': 'path-pattern',
                            'Values': [this.service.url]
                        }
                    ],
                    'ListenerArn': { 'Ref': `Cls${protocol}Listener` },
                    'Priority': this.priority
                }
            },
            [targetGroupName]: {
                'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
                'Properties': {
                    'Name': targetGroupName,
                    'HealthCheckIntervalSeconds': 10,
                    'HealthCheckPath': '/',
                    'HealthCheckProtocol': 'HTTP',
                    'HealthCheckTimeoutSeconds': 5,
                    'HealthyThresholdCount': 2,
                    'Port': 80,
                    'Protocol': 'HTTP',
                    'UnhealthyThresholdCount': 2,
                    'VpcId': this.cluster.vpcId
                }
            }
        };
        return resources;
    }
    get mapping() {
        if (!this.required())
            return [];
        return _.map(this.cluster.protocol, (protocol) => {
            return {
                'ContainerName': this.service.name,
                'ContainerPort': this.service.port,
                'TargetGroupArn': {
                    'Ref': `${this.service.name}${protocol}Target`
                }
            };
        });
    }
}
exports.Listener = Listener;
function reset() {
    priority = 0;
}
exports.reset = reset;
