"use strict";
var _ = require("lodash");
var execSync = require('child_process').execSync;
var service_1 = require("./service");
// this._serverless.service.provider.compiledCloudFormationTemplate.Resources[permRef] = permission;
var ServerlecsPlugin = (function () {
    function ServerlecsPlugin(serverless, options) {
        var _this = this;
        this.compile = function () {
            if (_this.hasService()) {
                _this.prepare();
                var services = _this.getServices();
                var resources_1 = _this.serverless.service.provider.compiledCloudFormationTemplate.Resources;
                _.each(services, function (opts, serviceName) {
                    _this.serverless.cli.log("Generating cfn resources for service " + serviceName);
                    var service = new service_1.Service(opts);
                    // console.log(resource.generate())
                    resources_1[serviceName] = service.generateResources();
                });
            }
        };
        this.build = function () {
            if (_this.hasService()) {
                _this.prepare();
                var services = _this.getServices();
                _.each(services, function (service, serviceName) {
                    _this.serverless.cli.log("Building service " + serviceName);
                    _.each(service.containers, function (container) {
                        _this.dockerBuildAndPush(container);
                    });
                });
            }
        };
        this.prepare = function () {
            if (_this.hasService()) {
                var services = _this.getServices();
                var tag_1 = _this.serverless.processedInput.options.tag;
                if (!tag_1) {
                    tag_1 = Math.floor(Date.now() / 1000);
                }
                _.each(services, function (service, serviceName) {
                    service.name = serviceName;
                    _this.serverless.cli.log("Preparing service " + serviceName + " with tag " + tag_1);
                    _.each(service.containers, function (container, containerName) {
                        container.name = containerName;
                        container.service = serviceName;
                        container.path = _this.serverless.config.servicePath + "/" + container.srcPath;
                        container.tag = service.repository + ":" + serviceName + "-" + tag_1;
                    });
                });
            }
        };
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
    ServerlecsPlugin.prototype.getServices = function () {
        return this.serverless.service.custom.serverlecs;
    };
    ServerlecsPlugin.prototype.hasService = function () {
        return this.serverless.service.custom && this.serverless.service.custom.serverlecs;
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
