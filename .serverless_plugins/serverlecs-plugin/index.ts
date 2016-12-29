import AWS = require('aws-sdk');

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

interface Container {
  path: string
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
       'ecs-build:build': this.build.bind(this)
    }
  }

  build() {
    console.log('ecs-build:build')

    if (this.serverless.service.custom && this.serverless.service.custom.serverlecs) {

      let services =  this.serverless.service.custom.serverlecs;

      for (let name in services) {
        let {cluster, repository, containers} = services[name];
        console.log(name);
        console.log(cluster);
        console.log(repository);

        let tag = `name-${Math.floor(Date.now() / 1000)}`
        console.log(tag)
        for (let container in containers) {
          this.dockerBuild(containers[container], tag)
        }

      }

      // console.log('repository: ', repo);

      // let docker = new Dockerode();
      // let container = 'serverlecs';
      // docker tag serverlecs:latest 005213230316.dkr.ecr.ap-southeast-2.amazonaws.com/serverlecs:latest
      // docker push 005213230316.dkr.ecr.ap-southeast-2.amazonaws.com/serverlecs:latest
    }

  }


  dockerBuild(container: Container, tag: string) {
    // console.log(container);
    let context = `${this.serverless.config.servicePath}/${container.path}`;
    console.log(`docker build -t ${tag} ${context}`);

    // const exec = require('child_process').exec;
    // const child = exec(`docker build -t ${container} ${dockerfile}`,
    //     (error, stdout, stderr) => {
    //         console.log(`stdout: ${stdout}`);
    //         console.log(`stderr: ${stderr}`);
    //         if (error !== null) {
    //             console.log(`exec error: ${error}`);
    //         }
    // });
  }
}

export = ServerlecsPlugin;
