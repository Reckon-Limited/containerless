"use strict";
var Listener = (function () {
    function Listener(service, cluster) {
        this.service = service;
        this.cluster = cluster;
    }
    Object.defineProperty(Listener.prototype, "listenerRuleName", {
        get: function () {
            return this.service.name + "ListenerRule";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Listener.prototype, "targetGroupName", {
        get: function () {
            return this.service.name + "TargetGroup";
        },
        enumerable: true,
        configurable: true
    });
    Listener.prototype.required = function () {
        return (this.service.url && this.service.port);
    };
    Listener.prototype.resources = function () {
        if (!this.required())
            return {};
        var resources = {};
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
    };
    Object.defineProperty(Listener.prototype, "mapping", {
        get: function () {
            if (!this.required())
                return [];
            return [{
                    'ContainerName': this.service.name,
                    'ContainerPort': this.service.port,
                    'TargetGroupArn': {
                        'Ref': this.targetGroupName
                    }
                }];
        },
        enumerable: true,
        configurable: true
    });
    return Listener;
}());
exports.Listener = Listener;
