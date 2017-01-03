"use strict";
var _ = require("lodash");
var listener_1 = require("./listener");
var Service = (function () {
    function Service(opts) {
        var _this = this;
        this.definition = function () {
            return {
                'Name': _this.name,
                'Essential': 'true',
                'Image': _this.opts.image,
                'Memory': _this.opts.memory || 128,
                'PortMappings': [
                    {
                        'ContainerPort': _this.opts.port
                    }
                ],
                'LogConfiguration': {
                    'LogDriver': 'awslogs',
                    'Options': {
                        'awslogs-group': {
                            'Ref': _this.logGroupName
                        },
                        'awslogs-region': {
                            'Ref': 'AWS::Region'
                        },
                        'awslogs-stream-prefix': {
                            'Ref': 'AWS::StackName'
                        }
                    }
                }
            };
        };
        this.opts = opts;
        this.listener = new listener_1.Listener(this.name, opts.load_balancer.vpcId, opts.port, opts.path);
        if (!this.opts.clusterId) {
            throw new TypeError('Service must define a Cluster Id');
        }
        if (!this.opts.port) {
            throw new TypeError('Application must define a Port');
        }
    }
    Object.defineProperty(Service.prototype, "taskDefinitionName", {
        get: function () {
            return this.name + "TaskDefinition";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Service.prototype, "logGroupName", {
        get: function () {
            return this.name + "CloudwatchLogGroup";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Service.prototype, "name", {
        get: function () {
            return _.camelCase(this.opts.name);
        },
        enumerable: true,
        configurable: true
    });
    Service.prototype.generateResources = function () {
        var resources = {};
        resources[this.name] = {
            'Type': 'AWS::ECS::Service',
            'Properties': {
                'Cluster': this.opts.clusterId,
                'DesiredCount': this.opts.count || 1,
                'LoadBalancers': [
                    this.listener.mapping()
                ],
                'Role': {
                    'Ref': 'ContainerlessELBRole'
                },
                'TaskDefinition': {
                    'Ref': this.taskDefinitionName
                }
            }
        };
        resources[this.taskDefinitionName] = {
            'Type': 'AWS::ECS::TaskDefinition',
            'Properties': {
                'Family': {
                    'Fn::Sub': '${AWS::StackName}-task'
                },
                'ContainerDefinitions': [this.definition()]
            }
        };
        resources[this.logGroupName] = {
            'Type': 'AWS::Logs::LogGroup',
            'Properties': {
                'LogGroupName': {
                    'Fn::Sub': this.name + "-${AWS::StackName}"
                },
                'RetentionInDays': 7
            }
        };
        return resources;
    };
    return Service;
}());
exports.Service = Service;
