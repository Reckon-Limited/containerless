"use strict";
var Listener = (function () {
    function Listener(name, vpcId, port, path) {
        this.name = name;
        this.vpcId = vpcId;
        this.port = port;
        this.path = path;
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
                        'Values': [this.path]
                    }
                ],
                'ListenerArn': { 'Ref': 'ContainerlessListener' },
                'Priority': 1
            }
        };
        resources[this.targetGroupName] = {
            'Type': 'AWS::ElasticLoadBalancingV2::TargetGroup',
            'DependsOn': this.name,
            'Properties': {
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
        return {
            'ContainerName': this.name,
            'ContainerPort': this.port,
            'TargetGroupArn': {
                'Ref': this.targetGroupName
            }
        };
    };
    return Listener;
}());
exports.Listener = Listener;
