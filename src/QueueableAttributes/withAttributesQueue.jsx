import { useState } from '@wordpress/element';

export default function withAttributesQueue(WrappedComponent){
    return function(props){
        let stateMap = {};
        //create state for all of our valid attributes
        for(const attName of props.queueableAttributes){
            if(attName === 'queueAttributes'){
                continue;
            }
            const [nextState, nextSetter] = useState(props.attributes[attName]);
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

        const [autoRenderTimeoutObject, setAutoRenderTimeoutObject] = useState(undefined);
        //FIX DEBOUNCE
        const queueAttribute = (attributeName, newValue, debounce = 0 ) => {
            stateMap[attributeName].setter(newValue);
            const newAttObj = {};
            newAttObj[attributeName] = newValue;
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
    }
};