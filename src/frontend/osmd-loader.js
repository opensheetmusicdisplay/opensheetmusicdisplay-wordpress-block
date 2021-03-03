import { OpenSheetMusicDisplay, OSMDOptions } from 'opensheetmusicdisplay';
import {OpenSheetMusicDisplayGlobalHooks} from 'opensheetmusicdisplay-wordpress-block';
/*
<div className="phonicscore-opensheetmusicdisplay__placeholder">
<div className="phonicscore-opensheetmusicdisplay__loading-spinner hide"></div>
<div className="phonicscore-opensheetmusicdisplay__render-block"></div>
<div style="display:none;" className="attributesAsJson" name="attributesAsJson">$asJson</div>
</div> 


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

*/

function FindOSMDCanvasElement(osmdRenderBlock){
    let renderCanvas = undefined;
    for (const nextChild of osmdRenderBlock.getElementsByTagName('div')){
        if(nextChild.id.startsWith('osmdCanvas')){
            renderCanvas = nextChild;
            break;
        }
    }
    return renderCanvas;
}

function FindOrCreateMessageBlock(osmdRenderBlock){
    let message = osmdRenderBlock.getElementsByClassName('phonicscore-opensheetmusicdisplay__message-block')[0];
    if(!message){
        message = document.createElement('div');
        message.classList.add('phonicscore-opensheetmusicdisplay__message-block');
        const messageHeading = document.createElement('h4');
        message.appendChild(messageHeading);
        const messageDetails = document.createElement('p');
        message.appendChild(messageDetails);
        osmdRenderBlock.appendChild(message);
    }

    return message;
}

function DisplayError(osmdRenderBlock, error, details){
    const renderCanvas = FindOSMDCanvasElement(osmdRenderBlock);
    const messageBlock = FindOrCreateMessageBlock(osmdRenderBlock);
    const messageHeading = messageBlock.getElementsByTagName('h4')[0];
    messageHeading.innerText = error;
    const messageDetails = messageBlock.getElementsByTagName('p')[0];
    messageDetails.innerText = details;
    if (renderCanvas) {
        renderCanvas.remove();
    }
}

const MAX_RELOAD_ATTEMPTS = 5;

const placeholders = document.getElementsByClassName('phonicscore-opensheetmusicdisplay__placeholder');
console.log('0', placeholders);
for(let i = 0; i < placeholders.length; i++){
    const currentPlaceholder = placeholders[i];
    console.log('1');
    const loader = currentPlaceholder.getElementsByClassName('phonicscore-opensheetmusicdisplay__loading-spinner')[0];
    loader.classList.remove('hide');

    const osmdRenderBlock = currentPlaceholder.getElementsByClassName('phonicscore-opensheetmusicdisplay__render-block')[0];
    if(!osmdRenderBlock){
        loader.classList.add('hide');
        continue;
    }
    console.log('2');
    const attributesElement = currentPlaceholder.getElementsByClassName('attributesAsJson')[0];
    if(!attributesElement || !attributesElement.innerText){
        continue;
    }
    console.log('3');
    let attributesMap = undefined;
    try {
        attributesMap = JSON.parse(attributesElement.innerText);
    } catch(err){
        loader.classList.add('hide');
        DisplayError(osmdRenderBlock, 'Invalid attributes provided.', err);
        continue;
    }
    console.log('4');
    if(!attributesMap){
        loader.classList.add('hide');
        continue;
    }
    console.log('5');
    const url = attributesMap.musicXmlUrl;
    if(!url || url.length < 1){
        loader.classList.add('hide');
        continue;
    }
    console.log('6');
    delete attributesMap.musicXmlUrl;

    let zoom = 1.0;
    if(attributesMap.zoom){
        zoom = parseFloat(attributesMap.zoom);
        if(zoom === NaN || zoom === undefined){
            zoom = 1.0;
        }
        delete attributesMap.zoom;
    }

    let aspectRatioAsFloat = 0.0;
    if(attributesMap.aspectRatio){
        aspectRatioAsFloat = parseFloat(attributesMap.aspectRatio);
        if(aspectRatioAsFloat === NaN || aspectRatioAsFloat === undefined){
            aspectRatioAsFloat = 0.0;
        }
        delete attributesMap.aspectRatio;
    }

    const updateHeight = () => {
        let height = 'auto';
        if(aspectRatioAsFloat > 0.0 && currentPlaceholder.offsetWidth){
            height = (currentPlaceholder.offsetWidth / aspectRatioAsFloat).toString() + 'px';
        }
        currentPlaceholder.style.height = height;
    };
    updateHeight();

    const currentOsmd = new OpenSheetMusicDisplay(osmdRenderBlock, attributesMap);

    let loadAttempt = 0;
    let loadFailed = false;

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
    let currentContainerWidth = osmdRenderBlock.offsetWidth;
    console.log('7');
    let timeoutObject = undefined;

    const resizeEvent = () => {
        if(loadFailed){
            return;
        }
        const prevWidth = currentContainerWidth;
        currentContainerWidth = osmdRenderBlock.offsetWidth;
        if(currentContainerWidth === prevWidth){
            return;
        }
        loader.classList.remove('hide');
        const renderCanvas = FindOSMDCanvasElement(osmdRenderBlock);
        if(renderCanvas)
            renderCanvas.remove();
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
        const resizeObserver = new ResizeObserver(entries => {
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
