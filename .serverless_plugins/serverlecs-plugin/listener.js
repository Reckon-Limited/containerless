"use strict";
var Listener = (function () {
    function Listener(name, opts) {
        this.name = name;
        this.vpcId = opts.load_balancer.vpcId;
        this.port = opts.port;
        this.pathPattern = opts.urlPath;
        this.priority = opts.priority;
    }
    Object.defineProperty(Listener.prototype, "listenerRuleName", {
        get: function () {
            return this.name + "ListenerRule";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Listener.prototype, "targetGroupName", {
        get: function () {
            return this.name + "TargetGroup";
        },
        enumerable: true,
        configurable: true
    });
    Listener.prototype.generateResources = function () {
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
                        'Values': [this.pathPattern]
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
                'VpcId': this.vpcId
            }
        };
        return resources;
    };
    Listener.prototype.mapping = function () {
        return [{
                'ContainerName': this.name,
                'ContainerPort': this.port,
                'TargetGroupArn': {
                    'Ref': this.targetGroupName
                }
            }];
    };
    return Listener;
}());
exports.Listener = Listener;
