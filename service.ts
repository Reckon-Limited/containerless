import _ = require('lodash');

import { Cluster } from './cluster'
import { Listener } from './listener'
import { Resource } from './resource'

export class Service implements Resource {

  public port: number
  public url: string

  private _name: string
  private _service: string

  private cluster: Cluster
  private count: number
  private environment: Array<any>
  private listener: Listener
  private logGroupRetention: number
  private memory: number
  private repository: string
  private tag: string

  constructor(cluster: Cluster, opts: any) {
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
      return {Name: k, Value: v}
    })

    this.port = opts.port;
    this.url = opts.url;

    if (this.port && !this.url) this.requireURL()
    if (this.url && !this.port) this.requirePort()

    this.listener = new Listener(this, cluster)
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
    return `${this.repository}:${this._name}-${this.tag}`
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
    let resources = this.listener.generate();

    resources[this.name] = {
      'Type': 'AWS::ECS::Service',
      'DependsOn': ["ContainerlessListener", this.taskDefinitionName],
      'Properties': {
        'Cluster': this.cluster.id,
        'DesiredCount': this.count,
        'TaskDefinition': {
          'Ref': this.taskDefinitionName
        },
        'LoadBalancers': this.listener.mapping
      }
    }

    if (this.listener.required()) {
      resources[this.name]['Properties']['Role'] = this.cluster.elbRole;
    }

    resources[this.taskDefinitionName] = {
      'Type': 'AWS::ECS::TaskDefinition',
      'Properties': {
        'Family': this.name,
        'ContainerDefinitions': this.definition()
      }
    }

    resources[this.logGroupName] = {
      'Type': 'AWS::Logs::LogGroup',
      'Properties': {
        'LogGroupName': {
          'Fn::Sub': `${this.name}-\${AWS::StackName}`
        },
        'RetentionInDays': this.logGroupRetention
      }
    }

    return resources;
  }

  definition = () => {

    let definition:any = {
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
    }

    if (this.port) {
      definition['PortMappings'] = [{ 'ContainerPort': this.port }]
    }

    return [definition]
  }

}
