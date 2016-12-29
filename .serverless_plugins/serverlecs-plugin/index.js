"use strict";
// this._serverless.service.provider.compiledCloudFormationTemplate.Resources[permRef] = permission;
// return self._serverless.cli.log('Function ' + info.FunctionArn + ' is already subscribed to ' + info.TopicArn);
class ServerlecsPlugin {
    constructor(serverless, options) {
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
        };
    }
    build() {
        console.log('ecs-build:build');
        if (this.serverless.service.custom && this.serverless.service.custom.serverlecs) {
            let services = this.serverless.service.custom.serverlecs;
            for (let name in services) {
                let { cluster, repository, containers } = services[name];
                console.log(name);
                console.log(cluster);
                console.log(repository);
                let tag = `name-${Math.floor(Date.now() / 1000)}`;
                console.log(tag);
                for (let container in containers) {
                    this.dockerBuild(containers[container], tag);
                }
            }
        }
    }
    dockerBuild(container, tag) {
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
module.exports = ServerlecsPlugin;
