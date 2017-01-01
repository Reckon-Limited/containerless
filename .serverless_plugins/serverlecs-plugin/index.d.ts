declare class ServerlecsPlugin {
    private serverless;
    private options;
    private commands;
    private hooks;
    provider: String;
    constructor(serverless: any, options: any);
    compile: () => void;
    build: () => void;
    prepare: () => void;
    dockerBuildAndPush(container: {
        tag: string;
        path: string;
    }): void;
    dockerPush(tag: string): void;
    dockerBuild(path: string, tag: string): void;
    getServices(): any;
    hasService(): any;
}
export = ServerlecsPlugin;
