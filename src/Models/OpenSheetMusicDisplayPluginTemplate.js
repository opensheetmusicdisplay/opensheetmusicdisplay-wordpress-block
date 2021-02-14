export default class OpenSheetMusicDisplayPluginTemplate{
    osmdSetupHook(osmdObject, props){
        console.warn("osmdSetupHook not overridden.");
    }

    preLoadFileHook(osmdObject, props){
        console.warn("preLoadFileHook not overridden.");
    }

    postLoadFileHook(osmdObject, props, error){
        console.warn("postLoadFileHook not overridden.");
    }

    preRenderHook(osmdObject, props){
        console.warn("preRenderHook not overridden.");
    }

    postRenderHook(osmdObject, props){
        console.warn("postRenderHook not overridden.");
    }

    processOptionsHook(osmdObject, options){
        console.warn("processOptionsHook not overridden.");
    }
}