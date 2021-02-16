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
        return {};
    }

    postSetupHook(osmdObject, props){
    }

    preLoadFileHook(osmdObject, props){
    }

    postLoadFileHook(osmdObject, props, error){
    }

    preRenderHook(osmdObject, props){
    }

    postRenderHook(osmdObject, props){
    }

    processOptionsHook(osmdObject, options){
    }
}