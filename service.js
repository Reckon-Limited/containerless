"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
                'Environment': _this.environment,
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
        this._service = opts.service;
        this._name = opts.name;
        this.tag = opts.tag || this.requireTag();
        this.repository = opts.repository || this.requireRepository();
        this.memory = opts.memory || 128;
        this.count = opts.count || 1;
        this.min_size = opts.min_size || 1;
        this.max_size = opts.max_size || this.min_size + 1;
        this.threshold = opts.threshold || 10;
        this.logGroupRetention = opts.log_group_retention || 7;
        this.environment = _.map(opts.environment, function (o) {
            var _a = _.chain(o).toPairs().flatten().value(), k = _a[0], v = _a[1];
            return { Name: k, Value: v };
        });
        this.port = opts.port;
        this.url = opts.url;
        if (this.port && !this.url)
            this.requireURL();
        if (this.url && !this.port)
            this.requirePort();
        this.listener = new listener_1.Listener(this, cluster);
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
            return this.repository + ":" + this._name + "-" + this.tag;
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
    Object.defineProperty(Service.prototype, "scalingTargetName", {
        get: function () {
            return this.name + "ScalingTarget";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Service.prototype, "scalingPolicyName", {
        get: function () {
            return this.name + "ScalingPolicy";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Service.prototype, "scalingAlarmName", {
        get: function () {
            return this.name + "ALBAlarm";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Service.prototype, "name", {
        get: function () {
            return _.chain(this._service + "-" + this._name).camelCase().upperFirst().value();
        },
        enumerable: true,
        configurable: true
    });
    Service.prototype.generate = function () {
        var resources = (_a = {},
            _a[this.name] = {
                'Type': 'AWS::ECS::Service',
                'DependsOn': [this.cluster.defaultListenerName, this.taskDefinitionName],
                'Properties': {
                    'Cluster': this.cluster.id,
                    'DesiredCount': this.count,
                    'TaskDefinition': {
                        'Ref': this.taskDefinitionName
                    },
                    'LoadBalancers': this.listener.mapping
                }
            },
            _a[this.taskDefinitionName] = {
                'Type': 'AWS::ECS::TaskDefinition',
                'Properties': {
                    'Family': this.name,
                    'ContainerDefinitions': this.definition()
                }
            },
            _a[this.logGroupName] = {
                'Type': 'AWS::Logs::LogGroup',
                'Properties': {
                    'LogGroupName': {
                        'Fn::Sub': this.name + "-${AWS::StackName}"
                    },
                    'RetentionInDays': this.logGroupRetention
                }
            },
            _a[this.scalingTargetName] = {
                'Type': 'AWS::ApplicationAutoScaling::ScalableTarget',
                'DependsOn': this.name,
                'Properties': {
                    'MaxCapacity': this.max_size,
                    'MinCapacity': this.min_size,
                    'ScalableDimension': 'ecs:service:DesiredCount',
                    'ServiceNamespace': 'ecs',
                    'ResourceId': {
                        'Fn::Join': [
                            '',
                            [
                                'service/',
                                { 'Ref': 'ClsCluster' },
                                '/',
                                { 'Fn::GetAtt': [this.name, 'Name'] }
                            ]
                        ]
                    },
                    'RoleARN': { 'Fn::GetAtt': ['ContainerlessASGRole', 'Arn'] }
                }
            },
            _a[this.scalingPolicyName] = {
                'Type': 'AWS::ApplicationAutoScaling::ScalingPolicy',
                'Properties': {
                    'PolicyName': 'ServiceStepPolicy',
                    'PolicyType': 'StepScaling',
                    'ScalingTargetId': {
                        'Ref': this.scalingTargetName
                    },
                    'StepScalingPolicyConfiguration': {
                        'AdjustmentType': 'PercentChangeInCapacity',
                        'Cooldown': 60,
                        'MetricAggregationType': 'Average',
                        'StepAdjustments': [
                            {
                                'MetricIntervalLowerBound': 0,
                                'ScalingAdjustment': 200
                            }
                        ]
                    }
                }
            },
            _a[this.scalingAlarmName] = {
                'Type': 'AWS::CloudWatch::Alarm',
                'Properties': {
                    'EvaluationPeriods': '1',
                    'Statistic': 'Average',
                    'Threshold': this.threshold,
                    'AlarmDescription': 'ALB HTTP 500 Error Service Alarm',
                    'Period': '60',
                    'AlarmActions': [{ 'Ref': this.scalingPolicyName }],
                    'Namespace': 'AWS/ApplicationELB',
                    'Dimensions': [
                        {
                            'Name': 'ContainerlessService',
                            'Value': {
                                'Ref': this.name
                            }
                        }
                    ],
                    'ComparisonOperator': 'GreaterThanThreshold',
                    'MetricName': 'HTTPCode_ELB_5XX_Count'
                }
            },
            _a);
        if (this.listener.required()) {
            resources[this.name]['Properties']['Role'] = this.cluster.elbRole;
        }
        var listeners = this.listener.generate();
        return _.assign(resources, listeners);
        ;
        var _a;
    };
    return Service;
}());
exports.Service = Service;
