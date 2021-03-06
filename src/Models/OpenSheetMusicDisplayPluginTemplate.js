export default class OpenSheetMusicDisplayPluginTemplate{
    constructor(pluginName){
        if(!pluginName){
            throw 'Unique plugin name must be specified for Wordpress.';
        }
        //With how exporting/compilation works this is the best we can do for now instead of instanceof....
        this._reflection = {
            class : {
                name : 'OpenSheetMusicDisplayPluginTemplate'
            },
            pluginName
        };
        const _self = this;
        // Adding the filter
        wp.hooks.addFilter(
            'blocks.getBlockAttributes',
            pluginName,
            (attributes, blockInformation) => {
                if(blockInformation.name === 'phonicscore/opensheetmusicdisplay'){
                    //Register ourself as a plugin so we get the hook calls on the backend
                    if(attributes && attributes.plugins && Array.isArray(attributes.plugins)){
                        attributes.plugins.push(_self);
                    }
                }
                return attributes;
            }
        );
    }
    //Return KV pairs of props that are provided to the OSMD react component (in the edit view)
    getOpenSheetMusicDisplayProps(props){
        return {};
    }

    postSetupHook(osmdObject, props, osmdHtmlElement){
    }

    preLoadFileHook(osmdObject, props, osmdHtmlElement){
    }

    postLoadFileHook(osmdObject, props, osmdHtmlElement, error){
    }

    preRenderHook(osmdObject, props, osmdHtmlElement, error){
    }

    postRenderHook(osmdObject, props, osmdHtmlElement){
    }

    processOptionsHook(osmdObject, options, osmdHtmlElement){
    }

    preReactRenderHook(osmdObject, props, osmdHtmlElement, jsx){
        return jsx;
    }
}