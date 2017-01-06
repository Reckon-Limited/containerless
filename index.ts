import AWS = require('aws-sdk');

import _ = require('lodash');

const execSync = require('child_process').execSync;

import { prepare } from './factory'

// import { Cluster } from './cluster';
// import { Service } from './service';
// import { ELB } from './elb';

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

// interface Serverless {
//   cli: any
//   config: any
// }

class ServerlecsPlugin {
  private serverless: any;
  private applications: Array<any>

  private commands: Commands;
  private hooks: Hooks;

  opts: any
  tag: string

  provider: String

  constructor(serverless: any, options: any) {
    this.serverless = serverless;
    this.provider = 'aws';

    this.tag = this.getTag();
    this.opts = this.getOptions();

    this.commands = {
      "cls-build": {
        usage: 'Build an ECS cluster',
        lifecycleEvents: ['run']
      }
    };

    this.hooks = {
      'deploy:compileFunctions': this.compile,
      'cls-build:run': this.build,
    }
  }

  compile = () => {

    let Resources = this.serverless.service.provider.compiledCloudFormationTemplate.Resources;

    let resources = prepare(this.tag, this.opts)

    _.each(resources, (resource) => {
      this.serverless.cli.log(`Building resources for ${resource.name}`);
      _.merge(Resources, resource.generate());
    });

  }

  build = () => {
    this.serverless.cli.log(`Configuring containerless`);
    _.each(this.opts.applications, (app, name: string) => {
      this.serverless.cli.log(`Building service ${name}`);

      if (!app.src) app.src = name;
      let opts = {
        path: `${this.serverless.config.servicePath}/${app.src}`,
        image: `${this.opts.repository}:${name}-${this.tag}`,
      }
      this.dockerBuildAndPush(_.merge(opts,app));
    });
  }

  dockerBuildAndPush(app: {image: string, path: string}) {
    this.dockerBuild(app.path, app.image);
    this.dockerPush(app.image);
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

  getTag() {
    if (this.serverless.processedInput.options.tag) {
      return this.serverless.processedInput.options.tag
    } else {
      return Math.floor(Date.now() / 1000);
    }
  }

  getOptions() {
    if (this.hasOptions) {
      return _.merge({}, this.serverless.service.custom.containerless);
    }
  }

  hasOptions() {
    return this.serverless.service.custom && this.serverless.service.custom.containerless;
  }

}

export = ServerlecsPlugin;
