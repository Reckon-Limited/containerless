"use strict";
var _ = require("lodash");
var execSync = require('child_process').execSync;
var cluster_1 = require("./cluster");
var service_1 = require("./service");
var elb_1 = require("./elb");
var serviceDefaults = {
    log_retention: 7
};
var clusterDefaults = {
    capacity: 1,
    max_size: 1,
    instance_type: 't2.micro'
};
var ServerlecsPlugin = (function () {
    function ServerlecsPlugin(serverless, options) {
        var _this = this;
        this.compile = function () {
            var resources = _this.serverless.service.provider.compiledCloudFormationTemplate.Resources;
            if (!_this.service.clusterId) {
                _this.service.clusterId = {
                    "Ref": "ContainerlessCluster"
                };
                _this.service.load_balancer.security_group = "ContainerlessSecurityGroup";
                _this.service.load_balancer.subnets = _this.service.subnets;
                _this.service.subnets = _this.service.subnets.join();
                _.merge({}, clusterDefaults, _this.service.cluster);
                var cluster = new cluster_1.Cluster(_this.service.cluster);
                _.merge(resources, cluster.generateResources());
            }
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
            _this.service.tag = tag;
            _this.serverless.cli.log("Preparing containerless service with tag " + tag);
            var applications = _.map(_this.service.applications, function (opts, name) {
                return _this.prepareApplication(name, opts);
            });
            var priority = 1;
            _.each(applications, function (app) {
                if (!app.priority) {
                    app.priority = priority;
                    priority++;
                }
            });
            return applications;
        };
        this.prepareApplication = function (name, opts) {
            var o = {
                name: name,
                clusterId: _this.service.clusterId,
                path: _this.serverless.config.servicePath + "/" + opts.srcPath,
                image: _this.service.repository + ":" + name + "-" + _this.service.tag,
                load_balancer: _.merge({}, _this.service.load_balancer, opts.load_balancer)
            };
            return _.merge(opts, o);
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
        this.dockerBuild(container.path, container.image);
        this.dockerPush(container.image);
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
            return _.merge({}, serviceDefaults, this.serverless.service.custom.containerless);
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
