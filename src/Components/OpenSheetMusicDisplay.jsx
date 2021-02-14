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
      this.osmd = undefined;
      this.osmdDivRef = React.createRef();
      this.loaderDivRef = React.createRef();
      this.plugins = [];
      if(props.plugins && props.plugins.length > 0){
        for(let i = 0; i < props.plugins.length; i++){
          if(props.plugins[i]?._reflection?.class?.name === 'OpenSheetMusicDisplayPluginTemplate'){
            this.plugins.push(props.plugins[i]);
          }
        }
      }
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
          this.plugins[i].processOptionsHook(this.osmd, options);
        }
      }
      return options;
    }

    renderBehavior(){
      if(this.plugins.length > 0){
        for(let i = 0; i < this.plugins.length; i++){
          this.plugins[i].preRenderHook(this.osmd, this.props);
        }
      }
      this.osmd.Zoom = this.props.zoom;
      this.osmd.render();
      if(this.plugins.length > 0){
        for(let i = 0; i < this.plugins.length; i++){
          this.plugins[i].postRenderHook(this.osmd, this.props);
        }
      }
      this.loaderDivRef.current.classList.remove('loader');
    }

    loadFileBehavior(){
      if(this.plugins.length > 0){
        for(let i = 0; i < this.plugins.length; i++){
          this.plugins[i].preLoadFileHook(this.osmd, this.props);
        }
      }
      const _self = this;
      this.loadAttempts++;
      this.pendingLoad = this.osmd.load(this.props.file);
      this.pendingLoad.then(function(){
        _self.loadAttempts = 0;
        _self.pendingLoad = undefined;
        if(_self.plugins.length > 0){
          for(let i = 0; i < _self.plugins.length; i++){
            _self.plugins[i].postLoadFileHook(_self.osmd, _self.props, undefined);
          }
        }
        _self.renderBehavior();
      },
      function(error){
        if(_self.plugins.length > 0){
          for(let i = 0; i < _self.plugins.length; i++){
            _self.plugins[i].postLoadFileHook(_self.osmd, _self.props, error);
          }
        }
        console.warn(error);
        if(_self.loadAttempts < _self.maxReloadAttempts){
          console.log("Attempting to reload...");
          _self.loadFileBehavior();
        } else {
          console.error("Max reload attempts reached. Failed to load file: " + _self.props.file);
        }
      });
    }
  
    setupOsmd() {
      const options = this.getOptionsObjectFromProps(this.props);
      this.osmd = new OSMD(this.osmdDivRef.current, options);
      if(this.plugins.length > 0){
        for(let i = 0; i < this.plugins.length; i++){
          this.plugins[i].osmdSetupHook(this.osmd, this.props);
        }
      }
      if(this.props.file){
        this.loadFileBehavior();
      }
    }
  
    resize() {
      this.osmd.render();
    }
  
    componentWillUnmount() {
      //console.log("componentWillUnmount");
      //window.removeEventListener('resize', this.resize);
    }

    componentDidUpdate(prevProps) {
      this.loaderDivRef.current.classList.add('loader');
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
      return (
        <div className="osmd-container">
          <div className="loader" ref={this.loaderDivRef}></div>
          <div className="osmd-render-block" ref={this.osmdDivRef} />
        </div>
        );
    }
  }