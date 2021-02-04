import { OpenSheetMusicDisplay, OSMDOptions } from 'opensheetmusicdisplay';
    const placeholders: HTMLCollectionOf<Element> = document.getElementsByClassName('osmd-container-placeholder');
    for(let i = 0; i < placeholders.length; i++){
        const currentPlaceholder: HTMLDivElement = placeholders[i] as HTMLDivElement;
        const urlElement: HTMLInputElement = currentPlaceholder.getElementsByClassName('musicXmlUrl')[0] as HTMLInputElement;
        if(!urlElement || !urlElement.value){
            continue;
        }
        const url: string = urlElement.value;
        urlElement.remove();
        const osmdRenderBlock: HTMLDivElement = currentPlaceholder.getElementsByClassName('osmd-render-block')[0] as HTMLDivElement;
        if(!osmdRenderBlock){
            continue;
        }

        const zoomElement: HTMLInputElement = currentPlaceholder.getElementsByClassName('zoom')[0] as HTMLInputElement;
        let zoom: number = 1.0;
        if(zoomElement && zoomElement.value){
            zoom = parseFloat(zoomElement.value);
            if(zoom === NaN){
                zoom = 1.0;
            }
        }
        zoomElement.remove();

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
        const loader: HTMLDivElement = currentPlaceholder.getElementsByClassName('loader')[0] as HTMLDivElement;
        const currentOsmd: OpenSheetMusicDisplay = new OpenSheetMusicDisplay(osmdRenderBlock, optionsObject);
        currentOsmd.load(url).then(function(){
            currentOsmd.Zoom = zoom;
            currentOsmd.render();
            loader.classList.add('hide');
        });
        let timeoutObject: NodeJS.Timeout = undefined;

        window.addEventListener("resize", function(event){
            loader.classList.remove('hide');
            clearTimeout(timeoutObject);
            timeoutObject = setTimeout(function(){
                currentOsmd.Zoom = zoom;
                currentOsmd.render();
                loader.classList.add('hide');
            }, 500);
        });
    }