export default class OpenSheetMusicDisplayPluginTemplate{
    constructor(pluginName){
        if(!pluginName){
            throw 'Unique plugin name must be specified for Wordpress.';
        }
        //With how exporting/compilation works this is the best we can do for now instead of instanceof....
        this._reflection = {
            class : {
                name : 'OpenSheetMusicDisplayPluginTemplate'
            }
        };
        const _self = this;
        // Adding the filter
        wp.hooks.addFilter(
            'blocks.getBlockAttributes',
            pluginName,
            (attributes, blockInformation) => {
                if(blockInformation.name === 'phonicscore/opensheetmusicdisplay'){
                    if(attributes && attributes.plugins && Array.isArray(attributes.plugins)){
                        attributes.plugins.push(_self);
                    }
                }
                return attributes;
            }
        );
    }

    getOpenSheetMusicDisplayProps(props){
        console.warn("registerOpenSheetMusicDisplayProps not overriden");
        return {};
    }

    postSetupHook(osmdObject, props){
        console.warn("postSetupHook not overridden.");
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