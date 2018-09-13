import React, { Component } from 'react';
import './App.css';
import * as d3 from 'd3';
import TimeRangeSlider from './keplergl/time-range-slider';
import permits from './json/permits.json';
import crimes from './json/crimes.json';
import {DateTime} from 'luxon'
import {Histogram} from './charts.js';
import ReactBootstrapSlider from 'react-bootstrap-slider';

const commas = d3.format(",")

// onChange: PropTypes.func.isRequired,
// domain: PropTypes.arrayOf(PropTypes.number).isRequired,
// value: PropTypes.arrayOf(PropTypes.number).isRequired,
// step: PropTypes.number.isRequired,
// plotType: PropTypes.string,
// histogram: PropTypes.arrayOf(PropTypes.any),
// lineChart: PropTypes.object,
// toggleAnimation: PropTypes.func.isRequired,
// isAnimatable: PropTypes.bool,
// isEnlarged: PropTypes.bool,
// speed: PropTypes.number


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value0:1,
      value1:12
    };
  }

  changeValue = e => {
    console.log(e)
  }

  onChange = (e) => {
    this.setState({value0:e[0],value1:e[1]})
  }

  render() {
    var values= crimes.features.map(feature => {return DateTime.fromISO(feature.properties.reported_d).toUTC()}).sort(d3.ascending)
    console.log(values)
    var numBins = 100
    

    const extent = d3.extent(values)

    var x  = d3.scaleLinear()
    .domain(extent)
    .nice()
    
    var histFn = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(numBins));
    
   

    const hist = histFn(values).map(bin => {return{x0:bin['x0'],x1:bin['x1'],count:bin.length}})
    const step = hist['x1'] - hist['x0']
    console.log(hist)
    
    return(
      <div style={{width:800,height:200}}>
            <div className={"filter-multiselect pt-2 w-100 pb-2"}>

       {/* <ReactBootstrapSlider
          id={'timeSlider'}
          slideStop={this.changeValue}
          range={true}
          step={5}
          max={extent[1]}
          min={extent[0]}
          value={extent}
          orientation="horiztonal"/> */}
        {/* <Histogram inputData={permits.features} 
          barStyle={{stroke:'#fff',strokeWidth:'10px',cursor:'pointer'}}
          hint={false} XAxis={false} YAxis={false} 
          gridlines={false} field={'IssuedDa_1'} 
          margin={{left: 0, right: 0, top: 0, bottom: 0}}/> */}
        <TimeRangeSlider histogram={hist} toggleAnimation={false} isEnlarged={true} isAnimatable={true} domain={extent} value={[this.state.value0,this.state.value1]} onChange={this.onChange} step={step}/>
      </div>
      </div>
      )
  }
}



export default App;
