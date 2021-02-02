import React, { PureComponent } from 'react';
import OSMDOptions, { OpenSheetMusicDisplay as OSMD} from 'opensheetmusicdisplay';

export class OpenSheetMusicDisplay extends PureComponent {
    constructor(props) {
      super(props);
      this.state = { dataReady: false, loadingClass: 'loader' };
      this.osmd = undefined;
      this.divRef = React.createRef();
      const _self = this;
      window.addEventListener('resize', function(){
        _self.resize();
      });
    }
  
    setupOsmd() {
      const options = {
        autoResize: this.props.autoResize !== undefined ? this.props.autoResize : true,
        drawTitle: this.props.drawTitle !== undefined ? this.props.drawTitle : true,
      }
      this.osmd = new OSMD(this.divRef.current, options);
      this.setState({loadingClass: 'loader'});
      if(this.props.file){
        const _self = this;
        _self.osmd.load(this.props.file).then(function(){
          _self.osmd.render();
          _self.setState({loadingClass: ''});
        });
      }
    }
  
    resize() {
      this.osmd.render();
    }
  
    componentWillUnmount() {
      window.removeEventListener('resize', this.resize);
    }
  
    componentDidUpdate(prevProps) {
      this.setState({loadingClass: 'loader'});
      if (this.props.file !== prevProps.file) {
        const _self = this;
        _self.osmd.load(this.props.file).then(function(){
          _self.osmd.render();
          _self.setState({loadingClass: ''});
        });
      } else {
        //TODO: other options
        this.osmd.setOptions({drawTitle: this.props.drawTitle});
        this.osmd.render();
        this.setState({loadingClass: ''});
      }
    }

    // Called after render
    componentDidMount() {
      this.setupOsmd();
    }
  
    render() {
      return (
        <div className="osmd-container">
          <div className= { this.state.loadingClass }></div>
          <div className="osmd-render-block" ref={this.divRef} />
        </div>
        );
    }
  }