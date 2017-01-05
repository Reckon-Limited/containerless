import { Cluster } from './cluster';
import { Resource } from './resource';
export declare class Service implements Resource {
    port: number;
    url: string;
    private _name;
    private cluster;
    private count;
    private listener;
    private logGroupRetention;
    private memory;
    private repository;
    private tag;
    constructor(cluster: Cluster, opts: any);
    requirePort(): void;
    requireRepository(): void;
    requireTag(): void;
    requireURL(): void;
    readonly image: string;
    readonly taskDefinitionName: string;
    readonly logGroupName: string;
    readonly name: string;
    generate(): any;
    definition: () => any[];
}
