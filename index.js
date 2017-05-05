"use strict";
const _ = require("lodash");
const execSync = require('child_process').execSync;
const factory_1 = require("./factory");
class ServerlecsPlugin {
    constructor(serverless, options) {
        this.compile = () => {
            let Resources = this.serverless.service.provider.compiledCloudFormationTemplate.Resources;
            let resources = factory_1.prepare(this.tag, this.opts);
            _.each(resources, (resource) => {
                this.serverless.cli.log(`Building resources for ${resource.name}`);
                _.merge(Resources, resource.generate());
            });
        };
        this.build = () => {
            this.serverless.cli.log(`Configuring containerless`);
            _.each(this.opts.applications, (app, name) => {
                this.serverless.cli.log(`Building service ${name}`);
                if (!app.src)
                    app.src = name;
                let opts = {
                    path: `${this.serverless.config.servicePath}/${app.src}`,
                    image: `${this.opts.repository}:${name}-${this.tag}`,
                };
                this.dockerBuildAndPush(_.merge(opts, app));
            });
        };
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
        };
    }
    dockerBuildAndPush(app) {
        this.dockerBuild(app.path, app.image);
        this.dockerPush(app.image);
        this.serverless.cli.log(`Built with tag: ${this.tag}`);
    }
    dockerPush(tag) {
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
    dockerBuild(path, tag) {
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
            return this.serverless.processedInput.options.tag;
        }
        else {
            return Math.floor(Date.now() / 1000);
        }
    }
    getOptions() {
        if (this.hasOptions) {
            return _.merge({ service: this.serverless.service.service }, this.serverless.service.custom.containerless);
        }
    }
    hasOptions() {
        return this.serverless.service.custom && this.serverless.service.custom.containerless;
    }
}
module.exports = ServerlecsPlugin;
