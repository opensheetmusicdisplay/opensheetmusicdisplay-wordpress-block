import React, { PureComponent } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
//TODO: Combine with React repo, use as npm dependency.
//TODO: Would be nice to use tsx and have typing on options
export class OpenSheetMusicDisplay extends PureComponent {
    constructor(props) {
      super(props);
      this.pendingLoad = undefined;
      this.loadAttempts = 0;
      this.maxReloadAttempts = this.props.maxReloadAttempts ? this.props.maxReloadAttempts : 3;
      this.showErrorCallback = this.props.showErrorCallback ? this.props.showErrorCallback : this.defaultErrorCallback;
      this.osmd = undefined;
      this.osmdDivRef = React.createRef();
      this.loaderDivRef = React.createRef();
      this.plugins = [];
      if(props.plugins && props.plugins.length > 0){
        for(let i = 0; i < props.plugins.length; i++){
          if(props.plugins[i]?._reflection?.class?.name === 'OpenSheetMusicDisplayPluginTemplate'){
            if (i > 0) {
              if(props.plugins[i-1]?._reflection?.pluginName === props.plugins[i]?._reflection?.pluginName){
                continue;
              }
            }
            this.plugins.push(props.plugins[i]);
          }
        }
      }
    }
    
    defaultErrorCallback(message, details){
      this.osmdDivRef.current.innerHTML = `<p><strong>${message}</strong>: <code>${details}</code></p>`;
    }

    getOptionsObjectFromProps(props){
      let options = {};
      const propKeys = Object.keys(props);
      for(let i = 0; i < propKeys.length; i++){
        const key = propKeys[i];
        if(key !== 'file' && key !== 'zoom' && key !== 'width'){
          options[key] = props[key];
        }
      }
      if(this.plugins.length > 0){
        for(let i = 0; i < this.plugins.length; i++){
          this.plugins[i].processOptionsHook(this.osmd, options, this.osmdDivRef.current);
        }
      }
      return options;
    }

    renderBehavior(){
      if(this.plugins.length > 0){
        for(let i = 0; i < this.plugins.length; i++){
          this.plugins[i].preRenderHook(this.osmd, this.props, this.osmdDivRef.current);
        }
      }
      this.osmd.Zoom = this.props.zoom;
      //little bit of a hack so that the loader is actually rendered.
      //Presently OSMD.render locks up the browser and by the time the loader would display, it's derendered
      //Best solution, though very involved, is for osmd to use web workers for rendering
      setTimeout(()=>{
        let error = undefined;
        try{
          this.osmd.render();
        } catch(err){
          console.warn('Error rendering: ', err);
          this.showErrorCallback(`Error rendering file: ${this.props.file}`, err);
        } finally{
          if(this.plugins.length > 0){
            for(let i = 0; i < this.plugins.length; i++){
              this.plugins[i].postRenderHook(this.osmd, this.props, this.osmdDivRef.current, error);
            }
          }
          this.loaderDivRef.current.classList.add('hide');
        }
      },250);
    }

    loadFileBehavior(){
      if(this.plugins.length > 0){
        for(let i = 0; i < this.plugins.length; i++){
          this.plugins[i].preLoadFileHook(this.osmd, this.props, this.osmdDivRef.current);
        }
      }
      this.loadAttempts++;
      this.pendingLoad = this.osmd.load(this.props.file);
      const _self = this;
      this.pendingLoad.then(function(){
        _self.loadAttempts = 0;
        _self.pendingLoad = undefined;
        if(_self.plugins.length > 0){
          for(let i = 0; i < _self.plugins.length; i++){
            _self.plugins[i].postLoadFileHook(_self.osmd, _self.props, _self.osmdDivRef.current);
          }
        }
        _self.renderBehavior();
      },
      function(error){
        if(_self.plugins.length > 0){
          for(let i = 0; i < _self.plugins.length; i++){
            _self.plugins[i].postLoadFileHook(_self.osmd, _self.props, _self.osmdDivRef.current, error);
          }
        }
        console.warn(error);
        if(_self.loadAttempts < _self.maxReloadAttempts){
          console.log('Attempting to reload...');
          _self.loadFileBehavior();
        } else {
          _self.loaderDivRef.current.classList.add('hide');
          _self.loadAttempts = 0;
          _self.pendingLoad = undefined;
          _self.showErrorCallback(`Failed to load file: ${_self.props.file}`, error);
          console.error(`Max reload attempts reached. Failed to load file: ${_self.props.file}`);
        }
      });
    }
  
    setupOsmd() {
      this.osmdDivRef.current.innerHTML = '';
      const options = this.getOptionsObjectFromProps(this.props);
      this.osmd = new OSMD(this.osmdDivRef.current, options);
      if(this.plugins.length > 0){
        for(let i = 0; i < this.plugins.length; i++){
          this.plugins[i].postSetupHook(this.osmd, this.props, this.osmdDivRef.current);
        }
      }
      if(this.props.file){
        this.loaderDivRef.current.classList.remove('hide');
        this.loadFileBehavior();
      }
    }
  
    resize() {
      this.osmd.render();
    }

    componentDidUpdate(prevProps) {
      this.osmdDivRef.current.innerHTML = '';
      this.loaderDivRef.current.classList.remove('hide');
      const options = this.getOptionsObjectFromProps(this.props);
      this.osmd.setOptions(options);
      if (this.props.file !== prevProps.file) {
        this.loadFileBehavior();
      }else{
        this.renderBehavior();
      }
    }

    // Called after render
    componentDidMount() {
      this.setupOsmd();
    }
  
    render() {
      let renderResult = (
        <div className="phonicscore-opensheetmusicdisplay">
          <div className="phonicscore-opensheetmusicdisplay__full-loading-spinner hide" ref={this.loaderDivRef}></div>
          <div className="phonicscore-opensheetmusicdisplay__render-block" ref={this.osmdDivRef} />
        </div>
        );
        if(this.plugins.length > 0){
          for(let i = 0; i < this.plugins.length; i++){
            renderResult = this.plugins[i].preReactRenderHook(this.osmd, this.props, this.osmdDivRef.current, renderResult);
          }
        }            
      return renderResult;
    }
  }