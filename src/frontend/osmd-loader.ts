import { OpenSheetMusicDisplay, OSMDOptions } from 'opensheetmusicdisplay';

function FindOSMDCanvasElement(osmdRenderBlock: HTMLDivElement): ChildNode{
    let renderCanvas: ChildNode = undefined;
    for (const nextChild of osmdRenderBlock.getElementsByTagName('div')){
        if(nextChild.id.startsWith('osmdCanvas')){
            renderCanvas = nextChild;
            break;
        }
    }
    return renderCanvas;
}

function FindOrCreateMessageBlock(osmdRenderBlock: HTMLDivElement): HTMLDivElement{
    let message: HTMLDivElement = osmdRenderBlock.getElementsByClassName('phonicscore-opensheetmusicdisplay__message-block')[0] as HTMLDivElement;
    if(!message){
        message = document.createElement('div');
        message.classList.add('phonicscore-opensheetmusicdisplay__message-block');
        const messageHeading: HTMLHeadingElement = document.createElement('h4');
        message.appendChild(messageHeading);
        const messageDetails: HTMLParagraphElement = document.createElement('p');
        message.appendChild(messageDetails);
        osmdRenderBlock.appendChild(message);
    }

    return message;
}

function DisplayError(osmdRenderBlock: HTMLDivElement, error: string, details: string){
    const renderCanvas: ChildNode = FindOSMDCanvasElement(osmdRenderBlock);
    const messageBlock: HTMLDivElement = FindOrCreateMessageBlock(osmdRenderBlock);
    const messageHeading: HTMLHeadingElement = messageBlock.getElementsByTagName('h4')[0];
    messageHeading.innerText = error;
    const messageDetails: HTMLParagraphElement = messageBlock.getElementsByTagName('p')[0];
    messageDetails.innerText = details;
    if (renderCanvas) {
        renderCanvas.remove();
    } 
}

const MAX_RELOAD_ATTEMPTS: number = 5;

const placeholders: HTMLCollectionOf<Element> = document.getElementsByClassName('phonicscore-opensheetmusicdisplay__placeholder');
for(let i = 0; i < placeholders.length; i++){
    const currentPlaceholder: HTMLDivElement = placeholders[i] as HTMLDivElement;
    const urlElement: HTMLInputElement = currentPlaceholder.getElementsByClassName('musicXmlUrl')[0] as HTMLInputElement;
    if(!urlElement || !urlElement.value){
        continue;
    }
    const url: string = urlElement.value;
    urlElement.remove();
    const osmdRenderBlock: HTMLDivElement = currentPlaceholder.getElementsByClassName('phonicscore-opensheetmusicdisplay__render-block')[0] as HTMLDivElement;
    if(!osmdRenderBlock){
        continue;
    }
    
    const loader = currentPlaceholder.getElementsByClassName('phonicscore-opensheetmusicdisplay__loading-spinner')[0] as HTMLDivElement;
    loader.classList.remove('hide');

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

    let loadAttempt: number = 0;
    let loadFailed: boolean = false;

    const loadBehavior = () => {
        loadAttempt++;
        currentOsmd.load(url).then(() => {
            currentOsmd.Zoom = zoom;
            try {
                currentOsmd.render();
            } catch(err){
                console.warn(err);
                DisplayError(osmdRenderBlock, 'Error loading sheet music file: ' + url, err);
            } finally {
                loader.classList.add('hide');
                loadAttempt = 0;
            }
        },
        function(err){
            console.warn(err);
            if(loadAttempt < MAX_RELOAD_ATTEMPTS){
                console.warn("Error loading. Attempting reload...");
                loadBehavior();
            } else {
                DisplayError(osmdRenderBlock, 'Error loading sheet music file: ' + url, err);
                loader.classList.add('hide');
                loadAttempt = 0;
                loadFailed = true;
            }
        });
    };

    loadBehavior();
    let currentContainerWidth: number = osmdRenderBlock.offsetWidth;

    let timeoutObject: NodeJS.Timeout = undefined;

    const resizeEvent: Function = () => {
        if(loadFailed){
            return;
        }
        const prevWidth: number = currentContainerWidth;
        currentContainerWidth = osmdRenderBlock.offsetWidth;
        if(currentContainerWidth === prevWidth){
            return;
        }
        loader.classList.remove('hide');
        const renderCanvas: ChildNode = FindOSMDCanvasElement(osmdRenderBlock);
        renderCanvas?.remove();
        clearTimeout(timeoutObject);
        timeoutObject = setTimeout(() => {
            updateHeight();
            currentOsmd.Zoom = zoom;
            try {
                currentOsmd.render();
            } catch(err){
                console.warn(err);
                DisplayError(osmdRenderBlock, 'Error loading sheet music file: ' + url, err);
            } finally {
                loader.classList.add('hide');
            }
        }, 500);
    };
    
    if(ResizeObserver){
        const resizeObserver: ResizeObserver = new ResizeObserver(entries => {
            resizeEvent();       
        });
        resizeObserver.observe(osmdRenderBlock);
    } else {
        console.info("Browser doesn't support ResizeObserver, defaulting to window resize");
        window.addEventListener('resize', (event) => {
            resizeEvent();
        });
    }
}
