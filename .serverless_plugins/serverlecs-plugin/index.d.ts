declare class ServerlecsPlugin {
    private serverless;
    private applications;
    private options;
    private commands;
    private hooks;
    service: any;
    provider: String;
    constructor(serverless: any, options: any);
    compile: () => void;
    build: () => void;
    prepare: () => any[];
    prepareApplication: (name: string, opts: any) => any;
    dockerBuildAndPush(container: {
        image: string;
        path: string;
    }): void;
    dockerPush(tag: string): void;
    dockerBuild(path: string, tag: string): void;
    getService(): any;
    hasService(): any;
}
export = ServerlecsPlugin;
