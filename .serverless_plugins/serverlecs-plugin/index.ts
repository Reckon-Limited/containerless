class ServerlecsPlugin {
  commands: any
  constructor() {
    this.commands = {
      deploy: {
        lifecycleEvents: [
          'resources',
          'functions'
        ]
      },
    };
  }
}

export { ServerlecsPlugin };
