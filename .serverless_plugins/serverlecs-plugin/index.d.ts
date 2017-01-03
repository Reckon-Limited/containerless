declare class ServerlecsPlugin {
    private serverless;
    private service;
    private applications;
    private options;
    private commands;
    private hooks;
    provider: String;
    constructor(serverless: any, options: any);
    compile: () => void;
    build: () => void;
    prepare: () => any[];
    dockerBuildAndPush(container: {
        tag: string;
        path: string;
    }): void;
    dockerPush(tag: string): void;
    dockerBuild(path: string, tag: string): void;
    getService(): any;
    hasService(): any;
}
export = ServerlecsPlugin;
