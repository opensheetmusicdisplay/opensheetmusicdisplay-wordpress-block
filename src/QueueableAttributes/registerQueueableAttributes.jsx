const withAttributesQueue = wp.compose.createHigherOrderComponent((WrappedComponent) => {
    return function(props){
        let queueableAttributes = props.attributes.queueableAttributes;
        if(!queueableAttributes || typeof queueableAttributes !== 'object'){
            queueableAttributes = [];
        }
        let stateMap = {};
        //create state for all of our valid attributes
        for(const attName of queueableAttributes){
            const [nextState, nextSetter] = wp.element.useState(props.attributes[attName]);
           stateMap[attName] = {
               value: nextState,
               setter: nextSetter
           };
        }

        const commitAttributes = () => {
            const keysList = Object.keys(stateMap);
            let updateObj = {};
            for(const key of keysList){
                updateObj[key] = stateMap[key].value;
            }
            props.setAttributes(updateObj);
        };

        const queueAttributes = typeof props.attributes.queueAttributes === 'boolean' ? props.attributes.queueAttributes : false;

        const [autoRenderTimeoutObject, setAutoRenderTimeoutObject] = wp.element.useState(undefined);
        const queueAttribute = (attributeName, newValue, debounce = 0 ) => {
            const newAttObj = {};
            if(Array.isArray(attributeName) && Array.isArray(newValue)){
                for(let i = 0; i < attributeName.length; i++){
                    stateMap[attributeName[i]].setter(newValue[i]);
                    newAttObj[attributeName[i]] = newValue[i];
                }
            } else {
                stateMap[attributeName].setter(newValue);
                newAttObj[attributeName] = newValue;
            }
            if(debounce > 0){
                clearTimeout(autoRenderTimeoutObject);
                const timeoutReturnObject = setTimeout(function(){
                    if(!queueAttributes){
                        //Immediately commit
                        props.setAttributes(newAttObj);
                    }
                }, debounce);
                setAutoRenderTimeoutObject(timeoutReturnObject);
            } else {
                if(!queueAttributes){
                    //Immediately commit
                    props.setAttributes(newAttObj);
                }
            }
        };

        return (<WrappedComponent {...props} queueAttribute={queueAttribute} commitAttributes={commitAttributes} queueableAttributes={stateMap}></WrappedComponent>);
    };
}, "withAttributesQueue");

wp.hooks.addFilter( 'editor.BlockEdit', 'phonicscore/opensheetmusicdisplay/block-edit-hook', withAttributesQueue, 99 );
