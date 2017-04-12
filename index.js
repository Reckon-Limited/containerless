"use strict";
var _ = require("lodash");
var execSync = require('child_process').execSync;
var factory_1 = require("./factory");
var ServerlecsPlugin = (function () {
    function ServerlecsPlugin(serverless, options) {
        var _this = this;
        this.compile = function () {
            var Resources = _this.serverless.service.provider.compiledCloudFormationTemplate.Resources;
            var resources = factory_1.prepare(_this.tag, _this.opts);
            _.each(resources, function (resource) {
                _this.serverless.cli.log("Building resources for " + resource.name);
                _.merge(Resources, resource.generate());
            });
        };
        this.build = function () {
            _this.serverless.cli.log("Configuring containerless");
            _.each(_this.opts.applications, function (app, name) {
                _this.serverless.cli.log("Building service " + name);
                if (!app.src)
                    app.src = name;
                var opts = {
                    path: _this.serverless.config.servicePath + "/" + app.src,
                    image: _this.opts.repository + ":" + name + "-" + _this.tag,
                };
                _this.dockerBuildAndPush(_.merge(opts, app));
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
    ServerlecsPlugin.prototype.dockerBuildAndPush = function (app) {
        this.dockerBuild(app.path, app.image);
        this.dockerPush(app.image);
        this.serverless.cli.log("Built with tag: " + this.tag);
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
    ServerlecsPlugin.prototype.getTag = function () {
        if (this.serverless.processedInput.options.tag) {
            return this.serverless.processedInput.options.tag;
        }
        else {
            return Math.floor(Date.now() / 1000);
        }
    };
    ServerlecsPlugin.prototype.getOptions = function () {
        if (this.hasOptions) {
            return _.merge({}, this.serverless.service.custom.containerless);
        }
    };
    ServerlecsPlugin.prototype.hasOptions = function () {
        return this.serverless.service.custom && this.serverless.service.custom.containerless;
    };
    return ServerlecsPlugin;
}());
module.exports = ServerlecsPlugin;
