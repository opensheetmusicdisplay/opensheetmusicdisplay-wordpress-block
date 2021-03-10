import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import {OpenSheetMusicDisplayGlobalHooks} from 'opensheetmusicdisplay-wordpress-block';

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
for(let i = 0; i < placeholders.length; i++){
    const currentPlaceholder = placeholders[i];
    const loader = currentPlaceholder.getElementsByClassName('phonicscore-opensheetmusicdisplay__loading-spinner')[0];
    loader.classList.remove('hide');

    const osmdRenderBlock = currentPlaceholder.getElementsByClassName('phonicscore-opensheetmusicdisplay__render-block')[0];
    if(!osmdRenderBlock){
        loader.classList.add('hide');
        continue;
    }
    const attributesElement = currentPlaceholder.getElementsByClassName('attributesAsJson')[0];
    if(!attributesElement || !attributesElement.innerText){
        continue;
    }
    let attributesMap = undefined;
    try {
        attributesMap = JSON.parse(attributesElement.innerText);
    } catch(err){
        loader.classList.add('hide');
        DisplayError(osmdRenderBlock, 'Invalid attributes provided.', err);
        continue;
    }
    if(!attributesMap){
        loader.classList.add('hide');
        continue;
    }
    const url = attributesMap.musicXmlUrl;
    if(!url || url.length < 1){
        loader.classList.add('hide');
        continue;
    }
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
    OpenSheetMusicDisplayGlobalHooks.applyFilters('phonicscore_opensheetmusicdisplay_options', undefined, attributesMap, osmdRenderBlock);
    const currentOsmd = new OpenSheetMusicDisplay(osmdRenderBlock, attributesMap);

    OpenSheetMusicDisplayGlobalHooks.didAction('phonicscore_opensheetmusicdisplay_setup');
    OpenSheetMusicDisplayGlobalHooks.applyFilters('phonicscore_opensheetmusicdisplay_setup', currentOsmd, attributesMap, osmdRenderBlock);

    let loadAttempt = 0;
    let loadFailed = false;

    const loadBehavior = () => {
        loadAttempt++;
        OpenSheetMusicDisplayGlobalHooks.applyFilters('phonicscore_opensheetmusicdisplay_load', currentOsmd, attributesMap, osmdRenderBlock);
        currentOsmd.load(url).then(() => {
            OpenSheetMusicDisplayGlobalHooks.didAction('phonicscore_opensheetmusicdisplay_load');
            OpenSheetMusicDisplayGlobalHooks.applyFilters('phonicscore_opensheetmusicdisplay_post-load', currentOsmd, attributesMap, osmdRenderBlock);
            currentOsmd.Zoom = zoom;
            try {
                OpenSheetMusicDisplayGlobalHooks.applyFilters('phonicscore_opensheetmusicdisplay_render', currentOsmd, attributesMap, osmdRenderBlock);
                currentOsmd.render();
            } catch(err){
                console.warn(err);
                DisplayError(osmdRenderBlock, 'Error loading sheet music file: ' + url, err);
            } finally {
                OpenSheetMusicDisplayGlobalHooks.didAction('phonicscore_opensheetmusicdisplay_render');
                loader.classList.add('hide');
                loadAttempt = 0;
            }
        },
        function(err){
            OpenSheetMusicDisplayGlobalHooks.applyFilters('phonicscore_opensheetmusicdisplay_post-load', currentOsmd, attributesMap, osmdRenderBlock, err);
            OpenSheetMusicDisplayGlobalHooks.didAction('phonicscore_opensheetmusicdisplay_load');
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
                OpenSheetMusicDisplayGlobalHooks.applyFilters('phonicscore_opensheetmusicdisplay_render', currentOsmd, attributesMap, osmdRenderBlock);
                currentOsmd.render();
            } catch(err){
                console.warn(err);
                DisplayError(osmdRenderBlock, 'Error loading sheet music file: ' + url, err);
            } finally {
                OpenSheetMusicDisplayGlobalHooks.didAction('phonicscore_opensheetmusicdisplay_render');
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
