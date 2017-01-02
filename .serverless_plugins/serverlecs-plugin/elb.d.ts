export interface ELBOpts {
    vpcId: string;
    subnets: Array<string>;
}
export declare class ELB {
    service: any;
    opts: ELBOpts;
    constructor(service: any);
    readonly name: string;
    readonly elbRoleName: string;
    readonly elbListenerName: string;
    readonly elbTargetGroupName: string;
    readonly elbSecurityGroup: string;
    generateResources(): any;
}
