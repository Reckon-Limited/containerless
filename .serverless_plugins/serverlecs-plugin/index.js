"use strict";
var ServerlecsPlugin = (function () {
    function ServerlecsPlugin() {
        this.commands = {
            deploy: {
                lifecycleEvents: [
                    'resources',
                    'functions'
                ]
            },
        };
    }
    return ServerlecsPlugin;
}());
exports.ServerlecsPlugin = ServerlecsPlugin;
