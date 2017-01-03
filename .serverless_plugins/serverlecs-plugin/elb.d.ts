export interface ELBOpts {
    vpcId: string;
    subnets: Array<string>;
    security_group: string;
}
export declare class ELB {
    opts: ELBOpts;
    constructor(opts: any);
    readonly name: string;
    readonly roleName: string;
    readonly listenerName: string;
    readonly targetGroupName: string;
    generateResources(): any;
    rolePolicy(): any;
    readonly securityGroupName: string;
    securityGroup(): any;
}
