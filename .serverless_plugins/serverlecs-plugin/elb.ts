const role = {
  'Type': 'AWS::IAM::Role',
  'Properties': {
    'AssumeRolePolicyDocument': {
      'Statement': [
        {
          'Effect': 'Allow',
          'Principal': {
            'Service': [
              'ecs.amazonaws.com'
            ]
          },
          'Action': [
            'sts:AssumeRole'
          ]
        }
      ]
    },
    'Path': '/',
    'Policies': [
      {
        'PolicyName': 'elb-role-policy',
        'PolicyDocument': {
          'Statement': [
            {
              'Effect': 'Allow',
              'Resource': '*',
              'Action': [
                'elasticloadbalancing:DeregisterInstancesFromLoadBalancer',
                'elasticloadbalancing:DeregisterTargets',
                'elasticloadbalancing:Describe*',
                'elasticloadbalancing:RegisterInstancesWithLoadBalancer',
                'elasticloadbalancing:RegisterTargets',
                'ec2:Describe*',
                'ec2:AuthorizeSecurityGroupIngress'
              ]
            }
          ]
        }
      }
    ]
  }
}

const elb = {
  'Type': 'AWS::ElasticLoadBalancingV2::LoadBalancer',
  'Properties': {
    'Scheme': 'internet-facing',
    'LoadBalancerAttributes': [
      {
        'Key': 'idle_timeout.timeout_seconds',
        'Value': 30
      }
    ],
    'Subnets': [],
    'SecurityGroups': [
      {
        'Ref': 'PublicSecurityGroup'
      }
    ]
  }
}

export class ELB {
  service: any

  constructor(service: any) {
    this.service = service;
  }

  get name() {
    return `${this.service.name}ELB`;
  }

  get elbRoleName() {
    return `${this.service.name}ELBRole`;
  }

  generateResources() {
    let resources = {}

    resources[this.elbRoleName] = role;
    resources[this.name] = elb;

    return resources;
  }
}
