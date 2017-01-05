declare class ServerlecsPlugin {
    private serverless;
    private applications;
    private options;
    private commands;
    private hooks;
    opts: any;
    tag: string;
    provider: String;
    constructor(serverless: any, options: any);
    compile: () => void;
    build: () => void;
    dockerBuildAndPush(app: {
        image: string;
        path: string;
    }): void;
    dockerPush(tag: string): void;
    dockerBuild(path: string, tag: string): void;
    getTag(): any;
    getOptions(): any;
    hasOptions(): any;
}
export = ServerlecsPlugin;
