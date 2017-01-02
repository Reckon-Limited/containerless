import _ = require('lodash');

import { ELB } from './elb'

export class Service {
  service: any
  resources: any
  elb: ELB

  constructor(opts: any) {
    this.service = opts;
    this.elb = new ELB(opts)
  }

  get taskDefinitionName() {
    return `${this.service.name}TaskDefinition`;
  }
  get logGroupName() {
    return `${this.service.name}CloudwatchLogGroup`;
  }

  generateResources() {
    let resources: any = this.elb.generateResources();

    console.log(resources);

    resources[this.service.name] = {
      'Type': 'AWS::ECS::Service',
      'Properties': {
        'Cluster': this.service.clusterId,
        'DesiredCount': this.service.count || 1,
        'LoadBalancers': this.loadBalancers(),
        'Role': {
          'Ref': this.elb.name
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
        'ContainerDefinitions': this.definitions()
      }
    }

    resources[this.logGroupName] = {
      'Type': 'AWS::Logs::LogGroup',
      'Properties': {
        'LogGroupName': {
          'Fn::Sub': `${this.service.name}-\${AWS::StackName}`
        },
        'RetentionInDays': 7
      }
    }

    return resources;
  }

  loadBalancers = () => {
    return _.map(this.service.containers, (container: any) => {
      return this.loadBalancer(container);
    });;
  }

  loadBalancer = (container: any) => {
    return {
      'ContainerName': container.name,
      'ContainerPort': container.port || 3000,
      'TargetGroupArn': {
        'Ref': 'ELBTargetGroup'
      }
    }
  }

  definitions = () => {
    return _.map(this.service.containers, (container: any) => {
      return this.definition(container);
    });;
  }

  definition = (container: any) => {
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
