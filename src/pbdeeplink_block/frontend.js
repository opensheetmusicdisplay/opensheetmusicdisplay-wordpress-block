import { OpenSheetMusicDisplayGlobalHooks } from 'opensheetmusicdisplay-wordpress-block';

(function(){
    const searchResult = document.getElementsByClassName('practicebird-deeplink__render-placeholder');
    for(let idx = 0; idx < searchResult.length; idx++){
        const nextElement = searchResult.item(idx);
        if(nextElement){
            const attributeResults = nextElement.getElementsByClassName('practicebird-deeplink__attributes');
            if(attributeResults && attributeResults.length > 0){
                let attributesAsText = undefined;
                if(attributeResults[0] instanceof HTMLElement){
                    attributesAsText = attributeResults[0].innerText.trim();
                }
                if(attributesAsText && attributesAsText !== ""){
                    let attributes = JSON.parse(attributesAsText);
                    if(attributes){
                        OpenSheetMusicDisplayGlobalHooks.didAction('phonicscore_practicebird_deeplink_setup');
                        attributes = OpenSheetMusicDisplayGlobalHooks.applyFilters('phonicscore_practicebird_deeplink_setup', attributes);
                        attributeResults[0].innerText = JSON.stringify(attributes);
                    }
                }
            }
        }
    }

    PracticeBirdDeepLink.ProcessQRPlaceholders();
})();