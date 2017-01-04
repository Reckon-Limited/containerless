import _ = require('lodash');

import { Listener } from './listener'

export interface ServiceOpts {
  clusterId:  string
  name:       string
  count:      number
  port:       number
  memory:     number
  image:      string
  log_retention: number
}

export class Service {
  opts:ServiceOpts
  resources: any
  listener: Listener

  constructor(opts: any) {
    this.opts = opts;

    if (opts.urlPath) {
      this.listener = new Listener(this.name, opts)
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

  get taskDefinitionName() {
    return `${this.name}TaskDefinition`;
  }
  get logGroupName() {
    return `${this.name}CloudwatchLogGroup`;
  }

  get name() {
     return _.camelCase(this.opts.name)
  }

  generateResources() {

    let resources = {}

    let service = {
      'Type': 'AWS::ECS::Service',
      'DependsOn': ["ContainerlessListener", "ContainerlessELBRole", this.taskDefinitionName],
      'Properties': {
        'Cluster': this.opts.clusterId,
        'DesiredCount': this.opts.count || 1,
        'TaskDefinition': {
          'Ref': this.taskDefinitionName
        }
      }
    }

    if (this.listener) {
      _.merge(resources,this.listener.generateResources());
      _.set(service, 'Properties.LoadBalancers', this.listener.mapping());
      _.set(service, 'Properties.Role', {'Ref': 'ContainerlessELBRole'});
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
    }

    resources[this.logGroupName] = {
      'Type': 'AWS::Logs::LogGroup',
      'Properties': {
        'LogGroupName': {
          'Fn::Sub': `${this.name}-\${AWS::StackName}`
        },
        'RetentionInDays': this.opts.log_retention
      }
    }

    return resources;
  }

  definition = () => {

    let definition = {
      'Name':this.name,
      'Essential': 'true',
      'Image': this.opts.image,
      'Memory': this.opts.memory || 128,
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
    }

    if (this.opts.port) {
     definition['PortMappings'] = [{ 'ContainerPort': this.opts.port }]
    }

    return [definition]
  }

}
