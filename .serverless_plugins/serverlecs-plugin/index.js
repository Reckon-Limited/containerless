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
        if (this.serverless.service.custom && this.serverless.service.custom.containers) {
            console.log('serverless: ', this.serverless.service.custom.containers);
        }
    }
}
module.exports = ServerlecsPlugin;
