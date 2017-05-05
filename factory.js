"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const elb_1 = require("./elb");
const cluster_1 = require("./cluster");
const service_1 = require("./service");
function prepare(tag, opts) {
    let cluster = new cluster_1.Cluster(opts.cluster);
    let elb = new elb_1.ELB(cluster);
    let applications = _.map(opts.applications, (app, name) => {
        let o = _.merge({}, { service: opts.service, name: name, path: opts.path, repository: opts.repository, tag: tag }, app);
        return new service_1.Service(cluster, o);
    });
    return _.concat(applications, cluster, elb);
}
exports.prepare = prepare;
