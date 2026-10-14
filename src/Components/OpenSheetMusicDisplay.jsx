import React, { PureComponent } from 'react';
import { getRenderingLibrary } from '../Rendering/getRenderingLibrary';
import { renderBraille, BRAILLE_ATTRIBUTE_NAMES } from '../Braille/renderBraille';
//TODO: Combine with React repo, use as npm dependency.
//TODO: Would be nice to use tsx and have typing on options
export class OpenSheetMusicDisplay extends PureComponent {
    constructor(props) {
      super(props);
      this.pendingLoad = undefined;
      this.mounted = false;
      this.loadGeneration = 0;
      this.renderTimeoutObject = undefined;
      this.loadAttempts = 0;
      this.maxReloadAttempts = this.props.maxReloadAttempts ? this.props.maxReloadAttempts : 3;
      this.showErrorCallback = this.props.showErrorCallback ? this.props.showErrorCallback : this.defaultErrorCallback;
      this.osmd = undefined;
      this.osmdDivRef = React.createRef();
      this.loaderDivRef = React.createRef();
      this.brailleDivRef = React.createRef();
      this.pluginManager = undefined;
      if(props.pluginManager?._reflection?.class?.name === 'OpenSheetMusicDisplayReactPluginManager'){
        this.pluginManager = props.pluginManager;
      }
    }
    
    defaultErrorCallback(message, details){
      if(!this.osmdDivRef.current){
        return;
      }
      this.osmdDivRef.current.innerHTML = `<p><strong>${message}</strong>: <code>${details}</code></p>`;
    }

    getOptionsObjectFromProps(props){
      let options = {};
      const propKeys = Object.keys(props);
      for(let i = 0; i < propKeys.length; i++){
        const key = propKeys[i];
        if(key !== 'file' && key !== 'zoom' && key !== 'width' && !BRAILLE_ATTRIBUTE_NAMES.includes(key)){
          options[key] = props[key];
        }
      }
      if(this.pluginManager?.getPlugins()?.length > 0){
        for(let i = 0; i < this.pluginManager.getPlugins().length; i++){
          this.pluginManager.getPlugins()[i].processOptionsHook(this.osmd, options, this.osmdDivRef.current);
        }
      }
      return options;
    }

    renderBehavior(){
      if(!this.mounted || !this.osmd || !this.osmd.Sheet){
        return;
      }
      if(this.pluginManager?.getPlugins()?.length > 0){
        for(let i = 0; i < this.pluginManager.getPlugins().length; i++){
          this.pluginManager.getPlugins()[i].preRenderHook(this.osmd, this.props, this.osmdDivRef.current);
        }
      }
      this.osmd.Zoom = this.props.zoom;
      //little bit of a hack so that the loader is actually rendered.
      //Presently OSMD.render locks up the browser and by the time the loader would display, it's derendered
      //Best solution, though very involved, is for osmd to use web workers for rendering
      clearTimeout(this.renderTimeoutObject);
      this.renderTimeoutObject = setTimeout(()=>{
        if(!this.mounted || !this.osmdDivRef.current || this.pendingLoad){
          return;
        }
        let error = undefined;
        try{
          this.osmd.render();
        } catch(err){
          error = err;
          console.warn('Error rendering: ', err);
          this.showErrorCallback(`Error rendering file: ${this.props.file}`, err);
        } finally{
          if(!this.pendingLoad){
            renderBraille(this.osmd, this.props, this.brailleDivRef.current);
          }
          try {
            if(this.pluginManager?.getPlugins()?.length > 0){
              for(let i = 0; i < this.pluginManager.getPlugins().length; i++){
                this.pluginManager.getPlugins()[i].postRenderHook(this.osmd, this.props, this.osmdDivRef.current, error);
              }
            }
          } catch(hookErr){
            // A hook registered by another plugin must never be able to leave the loading spinner stuck.
            console.error('Error in OSMD post-render plugin hook: ', hookErr);
          }
          this.loaderDivRef.current?.classList.add('hide');
        }
      },250);
    }

    loadFileBehavior(){
      if(!this.mounted || !this.osmd){
        return;
      }
      clearTimeout(this.renderTimeoutObject);
      const generation = ++this.loadGeneration;
      if(this.pluginManager?.getPlugins()?.length > 0){
        for(let i = 0; i < this.pluginManager.getPlugins().length; i++){
          this.pluginManager.getPlugins()[i].preLoadFileHook(this.osmd, this.props, this.osmdDivRef.current);
        }
      }
      this.loadAttempts++;
      this.pendingLoad = this.osmd.load(this.props.file);
      const _self = this;
      this.pendingLoad.then(function(){
        if(!_self.mounted || generation !== _self.loadGeneration){
          return;
        }
        _self.loadAttempts = 0;
        _self.pendingLoad = undefined;
        if(_self.pluginManager?.getPlugins()?.length > 0){
          for(let i = 0; i < _self.pluginManager.getPlugins().length; i++){
            _self.pluginManager.getPlugins()[i].postLoadFileHook(_self.osmd, _self.props, _self.osmdDivRef.current);
          }
        }
        _self.renderBehavior();
      },
      function(error){
        if(!_self.mounted || generation !== _self.loadGeneration){
          return;
        }
        if(_self.pluginManager?.getPlugins()?.length > 0){
          for(let i = 0; i < _self.pluginManager.getPlugins().length; i++){
            _self.pluginManager.getPlugins()[i].postLoadFileHook(_self.osmd, _self.props, _self.osmdDivRef.current, error);
          }
        }
        console.warn(error);
        if(_self.loadAttempts < _self.maxReloadAttempts){
          console.log('Attempting to reload...');
          _self.loadFileBehavior();
        } else {
          _self.loaderDivRef.current?.classList.add('hide');
          _self.loadAttempts = 0;
          _self.pendingLoad = undefined;
          _self.showErrorCallback(`Failed to load file: ${_self.props.file}`, error);
          console.error(`Max reload attempts reached. Failed to load file: ${_self.props.file}`);
        }
      });
    }
  
    setupOsmd() {
      const container = this.osmdDivRef.current;
      if(!container){
        return;
      }
      container.innerHTML = '';
      try {
        const { OpenSheetMusicDisplay: OSMD } = getRenderingLibrary(container, 'opensheetmusicdisplay');
        const options = this.getOptionsObjectFromProps(this.props);
        // Resizing is managed by the plugin rather than the renderer's window.
        options.autoResize = false;
        this.osmd = new OSMD(container, options);
        if(this.pluginManager?.getPlugins()?.length > 0){
          for(let i = 0; i < this.pluginManager.getPlugins().length; i++){
            this.pluginManager.getPlugins()[i].postSetupHook(this.osmd, this.props, container);
          }
        }
        if(this.props.file){
          this.loaderDivRef.current?.classList.remove('hide');
          this.loadFileBehavior();
        }
      } catch(error){
        this.osmd = undefined;
        this.loaderDivRef.current?.classList.add('hide');
        this.showErrorCallback('Could not initialize sheet music rendering', error);
      }
    }

    componentDidUpdate(prevProps) {
      if(!this.osmd){
        this.setupOsmd();
        return;
      }
      // A braille-only change must not trigger the slow, browser-blocking OSMD re-render.
      const onlyBrailleChanged = Object.keys({...prevProps, ...this.props}).every(
        (key) => BRAILLE_ATTRIBUTE_NAMES.includes(key) || prevProps[key] === this.props[key]
      );
      if(onlyBrailleChanged){
        if(!this.pendingLoad){
          renderBraille(this.osmd, this.props, this.brailleDivRef.current);
        }
        return;
      }
      this.osmdDivRef.current.innerHTML = '';
      if(this.brailleDivRef.current){
        this.brailleDivRef.current.innerHTML = '';
      }
      this.loaderDivRef.current?.classList.remove('hide');
      const options = this.getOptionsObjectFromProps(this.props);
      //We always want to manage resizing from here. Turn off autoresize
      options.autoResize = false;
      this.osmd.setOptions(options);
      if (this.props.file !== prevProps.file) {
        this.loadFileBehavior();
      }else{
        this.renderBehavior();
      }
    }

    resize(){
      const prevWidth = this.currentWidth;
      this.currentWidth = this.osmdDivRef.current.offsetWidth;
      //The gutenberg editor pane does little resizes when changed block selections, etc. 
      //Need this threshold to prevent annoying resizes
      if(Math.abs(this.currentWidth - prevWidth) < 32){
        return;
    }
      this.loaderDivRef.current?.classList.remove('hide');
      clearTimeout(this.timeoutObject);
      const self = this;
      this.timeoutObject = setTimeout(() => {
        self.renderBehavior();
      }, 500);
    }

    // Editor resizing stays manual, including when the editor iframe changes size.
    componentDidMount() {
      this.mounted = true;
      this.setupOsmd();
      this.currentWidth = this.osmdDivRef.current.offsetWidth;
    }

    componentWillUnmount() {
      this.mounted = false;
      this.loadGeneration++;
      clearTimeout(this.renderTimeoutObject);
      clearTimeout(this.timeoutObject);
      this.pendingLoad = undefined;
      this.osmd?.clear();
      this.osmd = undefined;
    }

    render() {
      let renderResult = (
        <div className="phonicscore-opensheetmusicdisplay">
          <div className="phonicscore-opensheetmusicdisplay__full-loading-spinner hide" ref={this.loaderDivRef}></div>
          <div
            className={'phonicscore-opensheetmusicdisplay__render-block' + (this.props.brailleEnabled && this.props.brailleHideScore ? ' phonicscore-opensheetmusicdisplay__render-block--hidden' : '')}
            ref={this.osmdDivRef}
          />
          <div className="phonicscore-opensheetmusicdisplay__braille" ref={this.brailleDivRef} />
        </div>
        );
        if(this.pluginManager?.getPlugins()?.length > 0){
          for(let i = 0; i < this.pluginManager.getPlugins().length; i++){
            this.pluginManager.getPlugins()[i].preReactRenderHook(this.osmd, this.props, this.osmdDivRef.current, renderResult);
          }
        }            
      return renderResult;
    }
  }