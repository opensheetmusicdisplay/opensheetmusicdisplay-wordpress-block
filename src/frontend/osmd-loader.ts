import { OpenSheetMusicDisplay, OSMDOptions } from 'opensheetmusicdisplay';

const placeholders: HTMLCollectionOf<Element> = document.getElementsByClassName('phonicscore-opensheetmusicdisplay__placeholder');
const loader = document.getElementsByClassName('phonicscore-opensheetmusicdisplay__loading-spinner')[0] as HTMLDivElement;
let promiseList: Array<Promise<undefined>> = [];
loader.classList.remove('hide');
for(let i = 0; i < placeholders.length; i++){
    let nextResolve: Function = undefined;
    let nextPromise: Promise<undefined> = new Promise((resolve)=>{
        nextResolve = resolve;
    });
    promiseList.push(nextPromise);
    const currentPlaceholder: HTMLDivElement = placeholders[i] as HTMLDivElement;
    const urlElement: HTMLInputElement = currentPlaceholder.getElementsByClassName('musicXmlUrl')[0] as HTMLInputElement;
    if(!urlElement || !urlElement.value){
        nextResolve();
        continue;
    }
    const url: string = urlElement.value;
    urlElement.remove();
    const osmdRenderBlock: HTMLDivElement = currentPlaceholder.getElementsByClassName('phonicscore-opensheetmusicdisplay__render-block')[0] as HTMLDivElement;
    if(!osmdRenderBlock){
        nextResolve();
        continue;
    }

    const zoomElement: HTMLInputElement = currentPlaceholder.getElementsByClassName('zoom')[0] as HTMLInputElement;
    let zoom: number = 1.0;
    if(zoomElement && zoomElement.value){
        zoom = parseFloat(zoomElement.value);
        if(zoom === NaN || zoom === undefined){
            zoom = 1.0;
        }
    }
    zoomElement.remove();

    const aspectRatioElement: HTMLInputElement = currentPlaceholder.getElementsByClassName('aspectRatio')[0] as HTMLInputElement;
    let aspectRatioAsFloat: number = 0.0;
    if(aspectRatioElement && aspectRatioElement.value){
        aspectRatioAsFloat = parseFloat(aspectRatioElement.value);
        if(aspectRatioAsFloat === NaN || aspectRatioAsFloat === undefined){
            aspectRatioAsFloat = 0.0;
        }
    }
    aspectRatioElement.remove();
    const updateHeight: Function = () => {
        let height: string = 'auto';
        if(aspectRatioAsFloat > 0.0 && currentPlaceholder.offsetWidth){
            height = (currentPlaceholder.offsetWidth / aspectRatioAsFloat).toString() + 'px';
        }
        currentPlaceholder.style.height = height;
    };
    updateHeight();

    const attributeElementList: HTMLCollectionOf<HTMLInputElement> = currentPlaceholder.getElementsByTagName('input');
    let optionsObject: OSMDOptions = {};
    for(let j = 0; j < attributeElementList.length; j++){
        let value: string | boolean | number | object = attributeElementList[j].value.toString();

        let type: string = attributeElementList[j].getAttribute('attributeType');
        switch(type) {
            case 'boolean':
                if(value === 'true'){
                    value = true;
                } else {
                    value = false;
                }
            break;
            case 'number':
                let num = parseFloat(value);
                if(num === NaN){
                    num = parseInt(value);
                }
                if(num !== NaN){
                    value = num;
                } else {
                    value = undefined;
                }
            break;
            case 'array':
            case 'object':
                if(value !== 'undefined'){
                    try {
                        value = JSON.parse(value);
                    } catch(error){
                        value = undefined;
                        console.warn("Couldn't parse object or array attribute: " + attributeElementList[j].name);
                    }
                }
            break;
            default://string, undefined
                if(!value || value === ''){
                    value = undefined;
                }
            break;
        }
        
        if(value === 'undefined'){
            value = undefined;
        }

        optionsObject[attributeElementList[j].name] = value;
    }
    const currentOsmd: OpenSheetMusicDisplay = new OpenSheetMusicDisplay(osmdRenderBlock, optionsObject);
    currentOsmd.load(url).then(() => {
        currentOsmd.Zoom = zoom;
        currentOsmd.render();
        nextResolve();
    },
    function(err){
        console.warn(err);
        nextResolve();
    });
    let timeoutObject: NodeJS.Timeout = undefined;

    window.addEventListener('resize', (event) =>{
        loader.classList.remove('hide');
        clearTimeout(timeoutObject);
        timeoutObject = setTimeout(() =>{
            updateHeight();
            currentOsmd.Zoom = zoom;
            currentOsmd.render();
            loader.classList.add('hide');
        }, 500);
    });
}
Promise.all(promiseList).then((): void => {
    loader.classList.add('hide');
    promiseList = [];
}).catch((): void => {
    loader.classList.add('hide');
    promiseList = [];
});