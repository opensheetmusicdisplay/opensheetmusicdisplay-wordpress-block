
export default class OpenSheetMusicDisplayReactPluginManager {
    constructor(){
        this._reflection = {
            class : {
                name : 'OpenSheetMusicDisplayReactPluginManager'
            }
        };
        this.plugins = [];
    }
    getPlugins(){
        return this.plugins;
    }
    registerPlugin(newPlugin){
        if(newPlugin?._reflection?.class?.name === 'OpenSheetMusicDisplayReactPluginTemplate'){
            this.plugins.push(newPlugin);
          }
    }
}