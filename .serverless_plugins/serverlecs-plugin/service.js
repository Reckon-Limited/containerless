"use strict";
var _ = require("lodash");
var listener_1 = require("./listener");
var Service = (function () {
    function Service(opts) {
        var _this = this;
        this.definition = function () {
            var definition = {
                'Name': _this.name,
                'Essential': 'true',
                'Image': _this.opts.image,
                'Memory': _this.opts.memory || 128,
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
            if (_this.opts.port) {
                definition['PortMappings'] = [{ 'ContainerPort': _this.opts.port }];
            }
            return [definition];
        };
        this.opts = opts;
        if (opts.urlPath) {
            this.listener = new listener_1.Listener(this.name, opts);
        }
        if (!this.opts.clusterId) {
            throw new TypeError('Service must define a Cluster Id');
        }
        if (opts.port && !this.opts.urlPath) {
            throw new TypeError('Application must define a URL Path when mapping a port');
        }
        if (opts.urlPath && !this.opts.port) {
            throw new TypeError('Application must define a Port when mapping a URL Path');
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
        var service = {
            'Type': 'AWS::ECS::Service',
            'DependsOn': ["ContainerlessListener", "ContainerlessELBRole", this.taskDefinitionName],
            'Properties': {
                'Cluster': this.opts.clusterId,
                'DesiredCount': this.opts.count || 1,
                'TaskDefinition': {
                    'Ref': this.taskDefinitionName
                }
            }
        };
        if (this.listener) {
            _.merge(resources, this.listener.generateResources());
            _.set(service, 'Properties.LoadBalancers', this.listener.mapping());
            _.set(service, 'Properties.Role', { 'Ref': 'ContainerlessELBRole' });
        }
        resources[this.name] = service;
        resources[this.taskDefinitionName] = {
            'Type': 'AWS::ECS::TaskDefinition',
            'Properties': {
                'Family': {
                    'Fn::Sub': '${AWS::StackName}-task'
                },
                'ContainerDefinitions': this.definition()
            }
        };
        resources[this.logGroupName] = {
            'Type': 'AWS::Logs::LogGroup',
            'Properties': {
                'LogGroupName': {
                    'Fn::Sub': this.name + "-${AWS::StackName}"
                },
                'RetentionInDays': this.opts.log_retention
            }
        };
        return resources;
    };
    return Service;
}());
exports.Service = Service;
