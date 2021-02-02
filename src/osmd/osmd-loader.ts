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

        const attributeElementList: HTMLCollectionOf<HTMLInputElement> = currentPlaceholder.getElementsByTagName('input');
        let optionsObject: OSMDOptions = {};
        for(let j = 0; j < attributeElementList.length; j++){
            let value: string | boolean | number = attributeElementList[j].value;
            if(value === 'true'){
                value = true;
            } else if(value === 'false') {
                value = false;
            }

            optionsObject[attributeElementList[j].name] = attributeElementList[j].value;
        }

        const loader: HTMLDivElement = currentPlaceholder.getElementsByClassName('loader')[0] as HTMLDivElement;
        const currentOsmd: OpenSheetMusicDisplay = new OpenSheetMusicDisplay(osmdRenderBlock, optionsObject);
        currentOsmd.load(url).then(function(){
            currentOsmd.render();
            loader.classList.add('hide');
        });

        window.addEventListener("resize", function(event){
            loader.classList.remove('hide');
            setTimeout(function(){
                currentOsmd.render();
                loader.classList.add('hide');
            }, 500);
        });
    }