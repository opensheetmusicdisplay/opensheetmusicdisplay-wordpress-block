function registerQueueableAttributes( settings, name ) {
    if(name !== "phonicscore/opensheetmusicdisplay"){
        return settings;
    }
    const queueableAttributes = [];
    for(const key of Object.keys(settings.attributes)){
        if(settings.attributes[key].queueable){
            queueableAttributes.push(key);
        }
    }
    const WrappedComponent = settings.edit;
    settings.edit = (props) => {
        return (
            <WrappedComponent {...props} queueableAttributes={queueableAttributes}></WrappedComponent>
        );
    };
    
    return settings;
}
wp.hooks.addFilter(
    'blocks.registerBlockType',
    'fredmeister77/queueable-attributes/register-queueable-attributes',
    registerQueueableAttributes
);