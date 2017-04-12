import { Cluster } from './cluster';
import { Resource } from './resource';
export declare class ELB implements Resource {
    cluster: Cluster;
    constructor(cluster: Cluster);
    readonly name: string;
    generate(): any;
}
