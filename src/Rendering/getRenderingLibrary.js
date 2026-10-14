// Editor scripts run in the admin window; block content can belong to an iframe.
export function getRenderingLibrary(container, name){
    const view = container && container.ownerDocument && container.ownerDocument.defaultView;
    const library = view && view[name];
    if(!library){
        throw new Error(`${name} is unavailable in the block's document.`);
    }
    return library;
}
