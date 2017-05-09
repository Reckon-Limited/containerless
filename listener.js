"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
// this is a terrible idea
var priority = 0;
var Listener = (function () {
    function Listener(service, cluster) {
        this.service = service;
        this.cluster = cluster;
        this.priority = this.calculatePriority();
    }
    Listener.prototype.calculatePriority = function () {
        return priority = priority + 1;
    };
    Object.defineProperty(Listener.prototype, "name", {
        get: function () {
            return this.service.name + "Listener";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Listener.prototype, "targetGroupName", {
        get: function () {
            return this.service.name + "Target";
        },
        enumerable: true,
        configurable: true
    });
    Listener.prototype.required = function () {
        return (this.service.url && this.service.port);
    };
    Listener.prototype.generate = function () {
        var _this = this;
        if (!this.required())
            return [];
        var definition = (_a = {},
            _a[this.targetGroupName] = {
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
            },
            _a);
        _.each(this.cluster.protocol, function (protocol) {
            definition["" + _this.service.name + protocol + "Rule"] = _this.generateForProtocol(protocol);
        });
        return definition;
        var _a;
    };
    Listener.prototype.generateForProtocol = function (protocol) {
        return {
            'Type': 'AWS::ElasticLoadBalancingV2::ListenerRule',
            "DependsOn": ["Cls" + protocol + "Listener", "Cls" + protocol + "TargetGroup", this.targetGroupName],
            'Properties': {
                'Actions': [
                    {
                        'TargetGroupArn': { 'Ref': this.targetGroupName },
                        'Type': 'forward'
                    }
                ],
                'Conditions': [
                    {
                        'Field': 'path-pattern',
                        'Values': [this.service.url]
                    }
                ],
                'ListenerArn': { 'Ref': "Cls" + protocol + "Listener" },
                'Priority': this.priority
            }
        };
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
function reset() {
    priority = 0;
}
exports.reset = reset;
