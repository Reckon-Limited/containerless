"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const listener_1 = require("./listener");
class Service {
    constructor(cluster, opts) {
        this.definition = () => {
            let definition = {
                'Name': this.name,
                'Essential': 'true',
                'Image': this.image,
                'Memory': this.memory,
                'Environment': this.environment,
                'LogConfiguration': {
                    'LogDriver': 'awslogs',
                    'Options': {
                        'awslogs-group': {
                            'Ref': this.logGroupName
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
            if (this.port) {
                definition['PortMappings'] = [{ 'ContainerPort': this.port }];
            }
            return [definition];
        };
        this.cluster = cluster;
        this._service = opts.service;
        this._name = opts.name;
        this.tag = opts.tag || this.requireTag();
        this.repository = opts.repository || this.requireRepository();
        this.count = opts.count || 1;
        this.memory = opts.memory || 128;
        this.logGroupRetention = opts.log_group_retention || 7;
        this.environment = _.map(opts.environment, (o) => {
            let [k, v] = _.chain(o).toPairs().flatten().value();
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
    requirePort() {
        throw new TypeError('Service definition requires a Port when mapping a URL');
    }
    requireRepository() {
        throw new TypeError('Service definition requires a Repository');
    }
    requireTag() {
        throw new TypeError('Service definition requires a Tag');
    }
    requireURL() {
        throw new TypeError('Service definition requires a URL when mapping a Port');
    }
    get image() {
        return `${this.repository}:${this._name}-${this.tag}`;
    }
    get taskDefinitionName() {
        return `${this.name}TaskDefinition`;
    }
    get logGroupName() {
        return `${this.name}CloudwatchLogGroup`;
    }
    get name() {
        return _.chain(`${this._service}-${this._name}`).camelCase().upperFirst().value();
    }
    generate() {
        let resources = {
            [this.name]: {
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
            [this.taskDefinitionName]: {
                'Type': 'AWS::ECS::TaskDefinition',
                'Properties': {
                    'Family': this.name,
                    'ContainerDefinitions': this.definition()
                }
            },
            [this.logGroupName]: {
                'Type': 'AWS::Logs::LogGroup',
                'Properties': {
                    'LogGroupName': {
                        'Fn::Sub': `${this.name}-\${AWS::StackName}`
                    },
                    'RetentionInDays': this.logGroupRetention
                }
            }
        };
        if (this.listener.required()) {
            resources[this.name]['Properties']['Role'] = this.cluster.elbRole;
        }
        let listeners = this.listener.generate();
        return Object.assign(resources, ...listeners);
        ;
    }
}
exports.Service = Service;
