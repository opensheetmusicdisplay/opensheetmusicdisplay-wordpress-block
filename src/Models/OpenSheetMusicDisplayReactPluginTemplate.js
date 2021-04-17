export default class OpenSheetMusicDisplayReactPluginTemplate{
    constructor(pluginName){
        if(!pluginName){
            throw 'Unique plugin name required.';
        }
        //With how exporting/compilation works this is the best we can do for now instead of instanceof....
        this._reflection = {
            class : {
                name : 'OpenSheetMusicDisplayReactPluginTemplate'
            },
            pluginName
        };
    }

    postSetupHook(osmdObject, props, osmdHtmlElement){
    }

    preLoadFileHook(osmdObject, props, osmdHtmlElement){
    }

    postLoadFileHook(osmdObject, props, osmdHtmlElement, error){
    }

    preRenderHook(osmdObject, props, osmdHtmlElement){
    }

    postRenderHook(osmdObject, props, osmdHtmlElement, error){
    }

    processOptionsHook(osmdObject, options, osmdHtmlElement){
    }

    preReactRenderHook(osmdObject, props, osmdHtmlElement, jsx){
    }

    nonRenderUpdateReactHook(osmdObject, newProps, osmdHtmlElement){
    }
}