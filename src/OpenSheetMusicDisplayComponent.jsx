import React, { PureComponent } from 'react';
import { OSMDOptions, OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

export class OpenSheetMusicDisplayComponent extends PureComponent {
    constructor(props) {
      super(props);
      this.pendingLoad = undefined;
      this.osmd = undefined;
      this.osmdDivRef = React.createRef();
      this.loaderDivRef = React.createRef();
      /*
      const _self = this;
      window.addEventListener('resize', function(){
        _self.resize();
      });*/
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
  
    setupOsmd() {
      const options = this.getOptionsObjectFromProps(this.props);
      this.osmd = new OpenSheetMusicDisplay(this.osmdDivRef.current, options);
      if(this.props.file){
        const _self = this;
        this.pendingLoad = this.osmd.load(this.props.file);
        this.pendingLoad.then(function(){
          _self.pendingLoad = undefined;
          _self.osmd.render();
          _self.loaderDivRef.current.classList.remove('loader');
        });
      }
    }
  
    resize() {
      this.osmd.render();
    }
  
    componentWillUnmount() {
      //console.log("componentWillUnmount");
      //window.removeEventListener('resize', this.resize);
    }
  /*
    shouldComponentUpdate(nextProps, nextState){
      if(nextProps.file !== this.props.file){
        return true;
      }

      const nextOptions = nextProps.options;
      const currentOptions = this.props.options;
      if(nextOptions === currentOptions){
        return true;
      }
      const nextOptionsKVPairs = Object.entries(nextOptions);
      const currentOptionsKVPairs = Object.entries(currentOptions);
      const testKeys = Object.keys(IOSMDOptions);
      for(let i = 0; i < testKeys.length; i++){
        console.log(testKeys[i]);
      }
      return false;
    }
*/
    componentDidUpdate(prevProps) {
      this.loaderDivRef.current.classList.add('loader');
      if (this.props.file !== prevProps.file) {
        const _self = this;
        this.pendingLoad = this.osmd.load(this.props.file);
        this.pendingLoad.then(function(){
          _self.pendingLoad = undefined;
          _self.osmd.render();
          _self.loaderDivRef.current.classList.remove('loader');
        });
        return;
      }
      
      if(this.props.zoom !== prevProps.zoom){
        this.osmd.Zoom = this.props.zoom;
      } else {
        const options = this.getOptionsObjectFromProps(this.props);
        console.log("updating options", options);
        this.osmd.setOptions(options);
      }

      if(!this.pendingLoad){
        this.osmd.render();
        this.loaderDivRef.current.classList.remove('loader');
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