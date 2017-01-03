import _ = require('lodash');

import { Listener } from './listener'

export interface ServiceOpts {
  clusterId:  string
  name:       string
  count:      number
  port:       number
  memory:     number
  image:      string
}

export class Service {
  opts:ServiceOpts
  resources: any
  listener: Listener

  constructor(opts: any) {
    this.opts = opts;

    this.listener = new Listener(this.name, opts.load_balancer.vpcId, opts.port, opts.path)

    if (!this.opts.clusterId) {
      throw new TypeError('Service must define a Cluster Id');
    }

    if (!this.opts.port) {
      throw new TypeError('Application must define a Port');
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
    let resources: any = {};

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
    }

    resources[this.taskDefinitionName] = {
      'Type': 'AWS::ECS::TaskDefinition',
      'Properties': {
        'Family': {
          'Fn::Sub': '${AWS::StackName}-task'
        },
        'ContainerDefinitions': [this.definition()]
      }
    }

    resources[this.logGroupName] = {
      'Type': 'AWS::Logs::LogGroup',
      'Properties': {
        'LogGroupName': {
          'Fn::Sub': `${this.name}-\${AWS::StackName}`
        },
        'RetentionInDays': 7
      }
    }

    return resources;
  }

  definition = () => {
    return {
      'Name':this.name,
      'Essential': 'true',
      'Image': this.opts.image,
      'Memory': this.opts.memory || 128,
      'PortMappings': [
        {
          'ContainerPort': this.opts.port
        }
      ],
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
  }

}
