"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var elb_1 = require("./elb");
var cluster_1 = require("./cluster");
var service_1 = require("./service");
function prepare(tag, opts) {
    var serviceStage = opts.stage ? opts.service + "-" + opts.stage : opts.service;
    var cluster = new cluster_1.Cluster(opts.cluster, serviceStage);
    var elb = new elb_1.ELB(cluster);
    var applications = _.map(opts.applications, function (app, name) {
        var o = _.merge({}, { service: opts.service, stage: opts.stage, name: name, path: opts.path, repository: opts.repository, tag: tag }, app);
        return new service_1.Service(cluster, o);
    });
    return _.concat(applications, cluster, elb);
}
exports.prepare = prepare;
