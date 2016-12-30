import AWS = require('aws-sdk');
import _ = require('lodash');
const execSync = require('child_process').execSync;

interface Command {
  usage: String
  lifecycleEvents: Array<string>;
  options?: {[key: string]: any}
}

interface Commands {
  [key: string]: Command;
}

interface Hooks {
  [key: string]: Function;
}

class Service {

}

interface Serverless {
  cli: any
  config: any
}

class Container {
  serverless: Serverless
  repository: string
  name: string
  path: string
  dir: string
  // image: string

  constructor(repository: string, name: string, dir: string, servicePath: string, path: string) {
    // this.serverless = serverless;
    this.repository = repository;
    this.name = name;
    this.dir = dir;
    this.path = path;
  }

  get tag() {
    return `${this.name}-${Math.floor(Date.now() / 1000)}`
  }

  get image() {
    return `${this.repository}:${this.tag}`
  }
}

// this._serverless.service.provider.compiledCloudFormationTemplate.Resources[permRef] = permission;
// return self._serverless.cli.log('Function ' + info.FunctionArn + ' is already subscribed to ' + info.TopicArn);

class ServerlecsPlugin {
  private serverless: any;
  private options: any;
  private commands: Commands;
  private hooks: Hooks;
  provider: String

  constructor(serverless: any, options: any) {
    this.serverless = serverless;
    this.options = options;
    this.provider = 'aws';

    this.commands = {
      "ecs-build": {
        usage: 'Build an ECS cluster',
        lifecycleEvents: ['build']
      }
    };

    this.hooks = {
      // 'deploy:createDeploymentArtifacts': this.build.bind(this),
      'deploy:compileFunctions': this.compile,
      // 'deploy:deploy': this.deploy.bind(this),
      'ecs-build:build': this.build,
    }
  }

  compile = () => {
    if (this.hasService()) {
      this.build();

      let services = this.getServices();
      let resources = this.serverless.service.provider.compiledCloudFormationTemplate.Resources;


      _.each(services, (service, name: string) => {
        this.serverless.cli.log(`Generating cfn for service ${name}`);
        // service.name = name;

        let definitions = _.map(service.containers, (container: any, name: string) => {
          return this.definition(container);
        });;

        resources[name] = {
          'Type': 'AWS::ECS::Service',
          'Properties': {
            'Cluster': service.cluster,
            'DesiredCount': service.count || 1,
            'LoadBalancers': [],
            'Role': {
              'Ref': 'ELBServiceRole'
            },
            'TaskDefinition': {
              'Ref': `${name}TaskDefinition`
            }
          }
        }

        resources[`${name}TaskDefinition`] = {
          'Type': 'AWS::ECS::TaskDefinition',
          'Properties': {
            'Family': {
              'Fn::Sub': '${AWS::StackName}-task'
            },
            'ContainerDefinitions': definitions
          }
        }
      });
    }
  }

  definition = (container: any) => {
    return {
      Name: `task-${container.name}`,
      Essential: 'true',
      Image: container.tag,
      Memory: container.memory,
      PortMappings: [
        {
          ContainerPort: 3000
        }
      ]
    }
  }

  // 'LogConfiguration': {
  //   'LogDriver": "awslogs",
  //   "Options": {
  //     "awslogs-group": {
  //       "Ref": "CloudwatchLogGroup"
  //     },
  //     "awslogs-region": {
  //       "Ref": "AWS::Region"
  //     },
  //     "awslogs-stream-prefix": {
  //       "Ref": "AWS::StackName"
  //     }
  //   }
  // },

  build = () => {
    if (this.hasService()) {
      let services = this.getServices();

      let tag = this.serverless.processedInput.options.tag;
      if (!tag) {
        tag = Math.floor(Date.now() / 1000);
      }

      _.each(services, (service, name: string) => {
        this.serverless.cli.log(`Building service ${name} with tag version ${tag}`);
        service.name = name;
        _.each(service.containers, (container: any, name: string) => {
          container.name = name;
          container.path = `${this.serverless.config.servicePath}/${container.srcPath}`;
          container.tag = `${service.repository}:${name}-${tag}`;
          this.dockerBuildAndPush(container);
        });
      });
      console.log(services['service'].containers['hello']);
    }
  }

  dockerBuildAndPush(container: {tag: string, path: string}) {
    this.dockerBuild(container.path, container.tag);
    this.dockerPush(container.tag);
  }

  dockerPush(tag: string) {
    let command = `docker push ${tag}`;

    this.serverless.cli.log(`Pushing image ${tag}`);

    if (process.env.SLS_DEBUG) {
      this.serverless.cli.log(command);
    }

    if (!process.env.SLS_DEBUG) {
      let result = execSync(command);
      this.serverless.cli.log(result);
    }
  }

  dockerBuild(path: string, tag: string) {
    let command = `docker build -t ${tag} ${path}`;

    this.serverless.cli.log(`Building image ${tag} at ${path}`);

    if (process.env.SLS_DEBUG) {
      this.serverless.cli.log(command);
    }
    let result = execSync(command);
    this.serverless.cli.log(result);
  }

  getServices() {
    return this.serverless.service.custom.serverlecs;
  }

  hasService() {
    return this.serverless.service.custom && this.serverless.service.custom.serverlecs;
  }
}

export = ServerlecsPlugin;


// dockerTag(tag: string, image: string) {
//   let command = `docker tag ${this.tag} ${this.image}`;
//
//   // this.serverless.cli.log(`Tagging image ${tag} at ${image}`);
//   //
//   // if (process.env.SLS_DEBUG) {
//   //   this.serverless.cli.log(command);
//   // }
//
//   // execSync(command);
// }
// console.log(containers);
//   for (let name in containers) {
//     let c = containers[name]
//
//     let context = `${this.serverless.config.servicePath}/${dir}`;
//
//     let container = new Container(repository, name, c.dir, c.path);
//     console.log(c.image);
//     // let tag = `${repository}:${name}-${Math.floor(Date.now() / 1000)}`
//     // container.image = tag;
//     // this.dockerBuild(container.src, tag);
//     // // this.dockerTag(tag, image);
//     // this.dockerPush(tag);
//   }
