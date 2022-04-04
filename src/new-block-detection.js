import { select, subscribe, dispatch } from '@wordpress/data';

(function(){
    let existingBlockMap = {};
    let existingBlockCount = 0;
    //Code inspired by: https://github.com/WordPress/gutenberg/issues/28032
    wp.domReady(() => {
        const getExistingBlocks = new Promise( ( resolve ) => {
                const unsubscribe = subscribe( () => {
                    //approximate editor ready by checking for clean post/blocks loaded
                    const isCleanNewPost = select( 'core/editor' ).isCleanNewPost();
                    if ( isCleanNewPost ) {
                        unsubscribe();
                        resolve([]);
                    }
                    const blocks = select( 'core/block-editor' ).getBlocks();
                    if ( blocks.length > 0 ) {
                        unsubscribe();
                        resolve(blocks);
                    }
                });
                //Timeout is not great, but if the post is previously saved AND empty, the above scenarios won't work
                //Currently don't have any better selectors for detecting this
                //Somewhat of an edge case anyway
                window.setTimeout(()=>{
                    unsubscribe();
                    resolve([]);
                }, 3000)
            });
        
        getExistingBlocks.then((blockList) => {
            for(let idx = 0; idx < blockList.length; idx++){
                if(blockList[idx].name === "phonicscore/opensheetmusicdisplay" &&
                   blockList[idx].clientId){
                    existingBlockMap[blockList[idx].clientId] = true;
                    existingBlockCount++;
                }
            }
            let userDefaults = {};
            userDefaults = wp.hooks.applyFilters('phonicscore_opensheetmusicdisplay_attributes-user-defaults', userDefaults);
            const defaultKeys = Object.keys(userDefaults);
            //Only need to do this if there are user defaults to set
            if(defaultKeys.length > 0){
                const processedUserDefaults = {};
                for(let userDefaultIdx = 0; userDefaultIdx < defaultKeys.length; userDefaultIdx++){
                    const key = defaultKeys[userDefaultIdx];
                    processedUserDefaults[key] = userDefaults[key].default;
                }
                //resub to watch for new blocks
                const unsubscribe = subscribe( () => {
                    const blocks = select( 'core/block-editor' ).getBlocks();
                    if ( blocks.length > existingBlockCount ) {
                        for(let newBlockIdx = 0; newBlockIdx < blocks.length; newBlockIdx++){
                            if(blocks[newBlockIdx].name === "phonicscore/opensheetmusicdisplay" &&
                            blocks[newBlockIdx].clientId &&
                            !existingBlockMap[blocks[newBlockIdx].clientId]){
                            //TODO: Process user defaults
                            existingBlockMap[blocks[newBlockIdx].clientId] = true;
                            existingBlockCount++;
                            //Don't let failure crash the editor
                            try {
                                dispatch( 'core/block-editor' ).updateBlockAttributes(blocks[newBlockIdx].clientId, {...blocks[newBlockIdx].attributes, ...processedUserDefaults});
                            } catch(e){

                            }
                            }
                        }
                    } else if (blocks.length < existingBlockCount) {//Block removed, see if its osmd
                        const remainingBlockList = [];
                        for(let changedBlockIdx = 0; changedBlockIdx < blocks.length; changedBlockIdx++){
                            if(blocks[changedBlockIdx].name === "phonicscore/opensheetmusicdisplay" &&
                                blocks[changedBlockIdx].clientId){
                                    remainingBlockList.push(blocks[changedBlockIdx].clientId);
                            }
                        }
                        existingBlockCount = remainingBlockList.length;
                        existingBlockMap = {};
                        for(let remainingIdx = 0; remainingIdx < remainingBlockList.length; remainingIdx++){
                            existingBlockMap[remainingBlockList[remainingIdx]] = true;
                        }
                    }
                });
            }
        });
    });
})();
