import AWS = require('aws-sdk');

import _ = require('lodash');

const execSync = require('child_process').execSync;

import { Service } from './service';

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

interface Serverless {
  cli: any
  config: any
}

// this._serverless.service.provider.compiledCloudFormationTemplate.Resources[permRef] = permission;

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

      this.prepare();
      let services = this.getServices();
      let resources = this.serverless.service.provider.compiledCloudFormationTemplate.Resources;

      _.each(services, (opts, serviceName: string) => {
        this.serverless.cli.log(`Generating cfn resources for service ${serviceName}`);
        let service = new Service(opts);
        _.merge(resources, service.generateResources());
      });

    }
  }

  build = () => {
    if (this.hasService()) {

      this.prepare();
      let services = this.getServices();

      _.each(services, (service, serviceName: string) => {
        this.serverless.cli.log(`Building service ${serviceName}`);
        _.each(service.containers, (container: any) => {
          this.dockerBuildAndPush(container);
        });
      });
    }
  }

  prepare = () => {
    if (this.hasService()) {
      let services = this.getServices();

      let tag = this.serverless.processedInput.options.tag;
      if (!tag) {
        tag = Math.floor(Date.now() / 1000);
      }

      _.each(services, (service, serviceName: string) => {
        service.name = serviceName;
        this.serverless.cli.log(`Preparing service ${serviceName} with tag ${tag}`);
        _.each(service.containers, (container: any, containerName: string) => {
          container.name = containerName;
          container.service = serviceName;
          container.path = `${this.serverless.config.servicePath}/${container.srcPath}`;
          container.tag = `${service.repository}:${serviceName}-${tag}`;
        });
      });
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
