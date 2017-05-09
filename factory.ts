import * as _ from 'lodash';

import { ELB } from './elb'
import { Cluster } from './cluster'
import { Resource } from './resource'
import { Service } from './service'

export function prepare(tag:string, opts:any): Array<Resource> {
  const serviceStage = opts.stage ? `${opts.service}-${opts.stage}` : opts.service;

  const cluster = new Cluster(opts.cluster, serviceStage);
  const elb = new ELB(cluster);

  const applications = _.map(opts.applications, (app:any, name: string) => {
    const o = _.merge({}, { service: opts.service, stage: opts.stage, name: name, path: opts.path, repository: opts.repository, tag: tag}, app);
    return new Service(cluster, o);
  });

  return _.concat(applications as Array<Resource>, cluster as Resource, elb as Resource);
}
