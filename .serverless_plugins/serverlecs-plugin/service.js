"use strict";
var _ = require("lodash");
var elb_1 = require("./elb");
var Service = (function () {
    function Service(opts) {
        var _this = this;
        this.loadBalancers = function () {
            return _.map(_this.service.containers, function (container) {
                return _this.loadBalancer(container);
            });
            ;
        };
        this.loadBalancer = function (container) {
            return {
                'ContainerName': container.name,
                'ContainerPort': container.port || 3000,
                'TargetGroupArn': {
                    'Ref': 'ELBTargetGroup'
                }
            };
        };
        this.definitions = function () {
            return _.map(_this.service.containers, function (container) {
                return _this.definition(container);
            });
            ;
        };
        this.definition = function (container) {
            return {
                'Name': container.name,
                'Essential': 'true',
                'Image': container.tag,
                'Memory': container.memory,
                'PortMappings': [
                    {
                        'ContainerPort': container.port || 3000
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
        this.service = opts;
        this.elb = new elb_1.ELB(opts);
    }
    Object.defineProperty(Service.prototype, "taskDefinitionName", {
        get: function () {
            return this.service.name + "TaskDefinition";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Service.prototype, "logGroupName", {
        get: function () {
            return this.service.name + "CloudwatchLogGroup";
        },
        enumerable: true,
        configurable: true
    });
    Service.prototype.generateResources = function () {
        var resources = this.elb.generateResources();
        console.log(resources);
        resources[this.service.name] = {
            'Type': 'AWS::ECS::Service',
            'Properties': {
                'Cluster': this.service.cluster,
                'DesiredCount': this.service.count || 1,
                'LoadBalancers': this.loadBalancers(),
                'Role': {
                    'Ref': this.elb.name
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
                'ContainerDefinitions': this.definitions()
            }
        };
        resources[this.logGroupName] = {
            'Type': 'AWS::Logs::LogGroup',
            'Properties': {
                'LogGroupName': {
                    'Fn::Sub': this.service.name + "-${AWS::StackName}"
                },
                'RetentionInDays': 7
            }
        };
        return resources;
    };
    return Service;
}());
exports.Service = Service;
