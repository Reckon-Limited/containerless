"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    get listenerRuleName() {
        return `${this.service.name}ListenerRule`;
    }
    get targetGroupName() {
        return `${this.service.name}TargetGroup`;
    }
    required() {
        return (this.service.url && this.service.port);
    }
    generate() {
        if (!this.required())
            return {};
        let resources = {};
        resources[this.listenerRuleName] = {
            'Type': 'AWS::ElasticLoadBalancingV2::ListenerRule',
            "DependsOn": ["ContainerlessListener", this.targetGroupName],
            'Properties': {
                'Actions': [
                    {
                        'TargetGroupArn': {
                            'Ref': this.targetGroupName
                        },
                        'Type': 'forward'
                    }
                ],
                'Conditions': [
                    {
                        'Field': 'path-pattern',
                        'Values': [this.service.url]
                    }
                ],
                'ListenerArn': { 'Ref': 'ContainerlessListener' },
                'Priority': this.priority
            }
        };
        resources[this.targetGroupName] = {
            'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
            'Properties': {
                'Name': this.targetGroupName,
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
        };
        return resources;
    }
    get mapping() {
        if (!this.required())
            return [];
        return [{
                'ContainerName': this.service.name,
                'ContainerPort': this.service.port,
                'TargetGroupArn': {
                    'Ref': this.targetGroupName
                }
            }];
    }
}
exports.Listener = Listener;
function reset() {
    priority = 0;
}
exports.reset = reset;
