"use strict";
var _ = require("lodash");
var listener_1 = require("./listener");
var Service = (function () {
    function Service(cluster, opts) {
        var _this = this;
        this.definition = function () {
            var definition = {
                'Name': _this.name,
                'Essential': 'true',
                'Image': _this.image,
                'Memory': _this.memory,
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
            if (_this.port) {
                definition['PortMappings'] = [{ 'ContainerPort': _this.port }];
            }
            return [definition];
        };
        this.cluster = cluster;
        this._name = opts.name;
        this.tag = opts.tag || this.requireRepository();
        this.repository = opts.repository || this.requireRepository();
        this.count = opts.count || 1;
        this.memory = opts.memory || 128;
        this.logGroupRetention = opts.log_group_retention || 7;
        this.port = opts.port;
        this.url = opts.url;
        if (this.port && !this.url)
            this.requireURL();
        if (this.url && !this.port)
            this.requirePort();
        this.listener = new listener_1.Listener(this, cluster);
        // this.servicePath = `${opts.path}/${opts.src}`
        // path: `${this.serverless.config.servicePath}/${opts.src}`,
    }
    Service.prototype.requirePort = function () {
        throw new TypeError('Service definition requires a Port when mapping a URL');
    };
    Service.prototype.requireRepository = function () {
        throw new TypeError('Service definition requires a Repository');
    };
    Service.prototype.requireTag = function () {
        throw new TypeError('Service definition requires a Tag');
    };
    Service.prototype.requireURL = function () {
        throw new TypeError('Service definition requires a URL when mapping a Port');
    };
    Object.defineProperty(Service.prototype, "image", {
        get: function () {
            return this.repository + ":" + this.name + "-" + this.tag;
        },
        enumerable: true,
        configurable: true
    });
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
            return _.upperFirst(_.camelCase(this._name));
        },
        enumerable: true,
        configurable: true
    });
    Service.prototype.resources = function () {
        var resources = this.listener.resources();
        resources[this.name] = {
            'Type': 'AWS::ECS::Service',
            'DependsOn': ["ContainerlessListener", "ContainerlessELBRole", this.taskDefinitionName],
            'Properties': {
                'Cluster': this.cluster.id,
                'DesiredCount': this.count,
                'TaskDefinition': {
                    'Ref': this.taskDefinitionName
                },
                'LoadBalancers': this.listener.mapping,
                'Role': this.cluster.elbRole
            }
        };
        resources[this.taskDefinitionName] = {
            'Type': 'AWS::ECS::TaskDefinition',
            'Properties': {
                'Family': this.name,
                'ContainerDefinitions': this.definition()
            }
        };
        resources[this.logGroupName] = {
            'Type': 'AWS::Logs::LogGroup',
            'Properties': {
                'LogGroupName': {
                    'Fn::Sub': this.name + "-${AWS::StackName}"
                },
                'RetentionInDays': this.logGroupRetention
            }
        };
        return resources;
    };
    return Service;
}());
exports.Service = Service;
