import React, { PureComponent } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

export class OpenSheetMusicDisplayComponent extends PureComponent {
    constructor(props) {
      super(props);
      this.pendingLoad = undefined;
      this.loadAttempts = 0;
      this.maxReloadAttempts = this.props.maxReloadAttempts ? this.props.maxReloadAttempts : 3;
      this.osmd = undefined;
      this.osmdDivRef = React.createRef();
      this.loaderDivRef = React.createRef();
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
      return options;
    }

    renderBehavior(){
      this.osmd.Zoom = this.props.zoom;
      this.osmd.render();
      this.loaderDivRef.current.classList.remove('loader');
    }

    loadFileBehavior(){
      const _self = this;
      this.loadAttempts++;
      this.pendingLoad = this.osmd.load(this.props.file);
      this.pendingLoad.then(function(){
        _self.loadAttempts = 0;
        _self.pendingLoad = undefined;
        _self.renderBehavior();
      },
      function(error){
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
      this.osmd = new OpenSheetMusicDisplay(this.osmdDivRef.current, options);
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