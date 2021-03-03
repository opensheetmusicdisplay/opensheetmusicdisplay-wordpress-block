import OpenSheetMusicDisplayReactPluginTemplate from './OpenSheetMusicDisplayReactPluginTemplate';

export default class OpenSheetMusicDisplayWordpressPlugin extends OpenSheetMusicDisplayReactPluginTemplate {
    constructor(pluginName, hooks){
        super(pluginName);
        this.hooks = hooks;
    }

    postSetupHook(osmdObject, props, osmdHtmlElement){
        this.hooks.didAction('phonicscore_opensheetmusicdisplay_setup');
        this.hooks.applyFilters('phonicscore_opensheetmusicdisplay_setup', osmdObject, props, osmdHtmlElement);
    }

    preLoadFileHook(osmdObject, props, osmdHtmlElement){
        this.hooks.applyFilters('phonicscore_opensheetmusicdisplay_load', osmdObject, props, osmdHtmlElement);
    }

    postLoadFileHook(osmdObject, props, osmdHtmlElement, error){
        this.hooks.didAction('phonicscore_opensheetmusicdisplay_load');
    }

    preRenderHook(osmdObject, props, osmdHtmlElement){
        this.hooks.applyFilters('phonicscore_opensheetmusicdisplay_render', osmdObject, props, osmdHtmlElement);
    }

    postRenderHook(osmdObject, props, osmdHtmlElement, error){
        this.hooks.didAction('phonicscore_opensheetmusicdisplay_render');
    }

    processOptionsHook(osmdObject, options, osmdHtmlElement){
        this.hooks.applyFilters('phonicscore_opensheetmusicdisplay_options', osmdObject, options, osmdHtmlElement);
    }

    preReactRenderHook(osmdObject, props, osmdHtmlElement, jsx){
        this.hooks.applyFilters('phonicscore_opensheetmusicdisplay_react-render', osmdObject, props, osmdHtmlElement, jsx);
    }
}
