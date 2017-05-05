import { Cluster } from './cluster';
import { Resource } from './resource';
export declare class ELB implements Resource {
    cluster: Cluster;
    private PORTS;
    constructor(cluster: Cluster);
    readonly name: string;
    generate(): any;
    generateListener(protocol: string): any;
}
