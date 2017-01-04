import AWS = require('aws-sdk');

import _ = require('lodash');

const execSync = require('child_process').execSync;


import { Cluster } from './cluster';
import { Service } from './service';
import { ELB } from './elb';

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

const serviceDefaults = {
  log_retention: 7
}

const clusterDefaults = {
  capacity: 1,
  max_size: 1,
  instance_type: 't2.micro'
}

class ServerlecsPlugin {
  private serverless: any;
  private applications: Array<any>

  private options: any;
  private commands: Commands;
  private hooks: Hooks;

  service: any

  provider: String

  constructor(serverless: any, options: any) {
    this.serverless = serverless;
    this.options = options;
    this.provider = 'aws';

    this.service = this.getService();
    this.applications = this.prepare();

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

    let resources = this.serverless.service.provider.compiledCloudFormationTemplate.Resources;

    if (!this.service.clusterId) {
      this.service.clusterId = {
        "Ref": "ContainerlessCluster"
      }

      this.service.load_balancer.security_group = "ContainerlessSecurityGroup"
      this.service.load_balancer.subnets = this.service.subnets
      this.service.subnets = this.service.subnets.join()

      _.merge({},clusterDefaults, this.service.cluster);
      
      let cluster = new Cluster(this.service.cluster);
      _.merge(resources, cluster.generateResources());

// capacity: number
// max_size: number
// vpcId: string
// instance_type: string
// vpcId:
//   Fn::ImportValue: triple-az-vpc-VpcID
// security_group:
//   Fn::ImportValue: vtha-SecurityGroup
// subnets:
//   - Fn::ImportValue: triple-az-vpc-PublicSubnetAz1
//   - Fn::ImportValue: triple-az-vpc-PublicSubnetAz2
//   - Fn::ImportValue: triple-az-vpc-PublicSubnetAz3
    }

    let elb = new ELB(this.service.load_balancer);

    _.merge(resources, elb.generateResources());

    _.each(this.applications, (app) => {
      this.serverless.cli.log(`Generating cfn resources for service ${app.name}`);
      let service = new Service(app);
      _.merge(resources, service.generateResources());
    });

  }

  build = () => {
    _.each(this.applications, (app, appName: string) => {
      this.serverless.cli.log(`Building service ${appName}`);
      this.dockerBuildAndPush(app);
    });
  }

  prepare = () => {
    let tag = this.serverless.processedInput.options.tag;
    if (!tag) {
      tag = Math.floor(Date.now() / 1000);
    }
    this.service.tag = tag;
    this.serverless.cli.log(`Preparing containerless service with tag ${tag}`);
    let applications = _.map(this.service.applications, (opts:any, name: string) => {
      return this.prepareApplication(name, opts);
    });

    let priority = 1;
    _.each(applications, (app:any) => {
      if (!app.priority) {
        app.priority = priority
        priority++
      }
    });
    return applications;
  }

  prepareApplication = (name:string, opts:any) => {
    let o = {
      name: name,
      clusterId: this.service.clusterId,
      path: `${this.serverless.config.servicePath}/${opts.srcPath}`,
      image: `${this.service.repository}:${name}-${this.service.tag}`,
      load_balancer: _.merge({}, this.service.load_balancer, opts.load_balancer)
    }
    return _.merge(opts, o);
  }

  dockerBuildAndPush(container: {image: string, path: string}) {
    this.dockerBuild(container.path, container.image);
    this.dockerPush(container.image);
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

  getService() {
    if (this.hasService) {
      return _.merge({}, serviceDefaults, this.serverless.service.custom.containerless);
    }
  }

  hasService() {
    return this.serverless.service.custom && this.serverless.service.custom.containerless;
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
