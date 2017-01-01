import _ = require('lodash');

export class Service {
  service: any
  resources: any

  constructor(opts: any) {
    this.service = opts;
  }

  get taskDefinitionName() {
    return `${this.service.name}TaskDefinition`;
  }
  get logGroupName() {
    return `${this.service.name}CloudwatchLogGroup`;
  }

  get elbRoleName() {
    return `${this.service.name}ELBRole`;
  }

  get elbRolePolicyName() {
    return `${this.service.name}ELBRole`;
  }

  generateResources() {
    let resources: any = {};

    resources[this.service.name] = {
      'Type': 'AWS::ECS::Service',
      'Properties': {
        'Cluster': this.service.cluster,
        'DesiredCount': this.service.count || 1,
        'LoadBalancers': [],
        'Role': {
          'Ref': this.elbRoleName
        },
        'TaskDefinition': {
          'Ref': this.taskDefinitionName
        }
      }
    }

    resources[this.elbRoleName] = {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "AssumeRolePolicyDocument": {
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": [
                  "ecs.amazonaws.com"
                ]
              },
              "Action": [
                "sts:AssumeRole"
              ]
            }
          ]
        },
        "Path": "/",
        "Policies": [
          {
            "PolicyName": this.elbRolePolicyName,
            "PolicyDocument": {
              "Statement": [
                {
                  "Effect": "Allow",
                  "Resource": "*",
                  "Action": [
                    "elasticloadbalancing:DeregisterInstancesFromLoadBalancer",
                    "elasticloadbalancing:DeregisterTargets",
                    "elasticloadbalancing:Describe*",
                    "elasticloadbalancing:RegisterInstancesWithLoadBalancer",
                    "elasticloadbalancing:RegisterTargets",
                    "ec2:Describe*",
                    "ec2:AuthorizeSecurityGroupIngress"
                  ]
                }
              ]
            }
          }
        ]
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
        'LogDriver': "awslogs",
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
