"use strict";
var _ = require("lodash");
var execSync = require('child_process').execSync;
var service_1 = require("./service");
var elb_1 = require("./elb");
// this._serverless.service.provider.compiledCloudFormationTemplate.Resources[permRef] = permission;
var ServerlecsPlugin = (function () {
    function ServerlecsPlugin(serverless, options) {
        var _this = this;
        this.compile = function () {
            var resources = _this.serverless.service.provider.compiledCloudFormationTemplate.Resources;
            var elb = new elb_1.ELB(_this.service.load_balancer);
            _.merge(resources, elb.generateResources());
            _.each(_this.applications, function (app) {
                _this.serverless.cli.log("Generating cfn resources for service " + app.name);
                var service = new service_1.Service(app);
                _.merge(resources, service.generateResources());
            });
        };
        this.build = function () {
            _.each(_this.applications, function (app, appName) {
                _this.serverless.cli.log("Building service " + appName);
                _this.dockerBuildAndPush(app);
            });
        };
        this.prepare = function () {
            var tag = _this.serverless.processedInput.options.tag;
            if (!tag) {
                tag = Math.floor(Date.now() / 1000);
            }
            _this.serverless.cli.log("Preparing containerless service with tag " + tag);
            return _.map(_this.service.applications, function (app, appName) {
                var obj = {
                    name: appName,
                    clusterId: _this.service.clusterId,
                    load_balancer: _this.service.load_balancer,
                    path: _this.serverless.config.servicePath + "/" + app.srcPath,
                    image: _this.service.repository + ":-" + appName + "-" + tag
                };
                return _.merge(app, obj);
            });
        };
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
        };
    }
    ServerlecsPlugin.prototype.dockerBuildAndPush = function (container) {
        this.dockerBuild(container.path, container.tag);
        this.dockerPush(container.tag);
    };
    ServerlecsPlugin.prototype.dockerPush = function (tag) {
        var command = "docker push " + tag;
        this.serverless.cli.log("Pushing image " + tag);
        if (process.env.SLS_DEBUG) {
            this.serverless.cli.log(command);
        }
        if (!process.env.SLS_DEBUG) {
            var result = execSync(command);
            this.serverless.cli.log(result);
        }
    };
    ServerlecsPlugin.prototype.dockerBuild = function (path, tag) {
        var command = "docker build -t " + tag + " " + path;
        this.serverless.cli.log("Building image " + tag + " at " + path);
        if (process.env.SLS_DEBUG) {
            this.serverless.cli.log(command);
        }
        var result = execSync(command);
        this.serverless.cli.log(result);
    };
    ServerlecsPlugin.prototype.getService = function () {
        if (this.hasService) {
            return this.serverless.service.custom.containerless;
        }
    };
    ServerlecsPlugin.prototype.hasService = function () {
        return this.serverless.service.custom && this.serverless.service.custom.containerless;
    };
    return ServerlecsPlugin;
}());
module.exports = ServerlecsPlugin;
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
