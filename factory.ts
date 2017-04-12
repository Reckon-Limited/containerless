import * as _ from 'lodash';

import { ELB } from './elb'
import { Cluster } from './cluster'
import { Resource } from './resource'
import { Service } from './service'

export function prepare(tag:string, opts:any): Array<Resource> {
  let cluster = new Cluster(opts.cluster) ;
  let elb = new ELB(cluster);

  let applications = _.map(opts.applications, (app:any, name: string) => {
    let o = _.merge({}, { service: opts.service, name: name, path: opts.path, repository: opts.repository, tag: tag}, app);
    return new Service(cluster, o);
  });

  return _.concat(applications as Array<Resource>, cluster as Resource, elb as Resource);
}
