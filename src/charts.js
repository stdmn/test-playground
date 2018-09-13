import React, { Component } from 'react';
// import './App.css';
import * as d3 from 'd3';
// import transit from './json/transit.json'
// import permits from './json/permits.json'
import {FlexibleWidthXYPlot, XAxis, YAxis, VerticalGridLines, VerticalRectSeries, HorizontalGridLines, HorizontalBarSeries,  Hint} from 'react-vis';

const commas = d3.format(",")

export class BarChart extends Component {
    constructor(props) {
      super(props);
      this.state = {
        crosshairValues: null,
        index: null
      };
    }
  
    mouseOut() {
      this.setState({crosshairValues:null, index:null})
    }
  
    mouseOver(datapoint) {
      this.setState({crosshairValues:datapoint})
    }
  
    render() {
      var inputData = this.props.inputData
      console.log(inputData)
      const field = this.props.field
      console.log(field)
      var dataset= inputData.map(feature => {return feature.properties[field]}).sort(d3.ascending)
      
  
      var counts = {}, i, value;
      for (i = 0; i < dataset.length; i++) {
          value = dataset[i];
          if (typeof counts[value] === "undefined") {
              counts[value] = 1;
          } else {
              counts[value]++;
          }
      }
  
      const myPalette = ['orange','red']
      var data = Object.entries(counts).map(entry => {return {y:entry[0],x:entry[1]}})
      var titles = d3.max(Object.entries(counts).map(entry => {return entry[0].length}))
      const margins = this.props.margin
      if (titles > 9) {
        margins['left'] = 70
      } else {
        margins['left'] = titles*6+10
      }
      data.splice(300,1000000)
      
      const {index} = this.state;
      const colorData = data.map((d, i) => ({...d, color: i === index ? 1 : 0}));
      
      return (
        <div style={{position:'relative', maxHeight:400,width:300, overflow:'scroll'}}>
          <FlexibleWidthXYPlot
            // colorRange="linear"
            colorDomain={[0, 1]}
            // colorRange={myPalette}
            onMouseLeave={() => this.setState({crosshairValues:null,index:null})}
            height={Math.max(data.length*11,200)}
            margin={{margins}}
            yType="ordinal">
            <VerticalGridLines width={3} style={{ 
              line: {stroke: '#333', strokeWidth:1}}}/>
            <HorizontalBarSeries
              onValueMouseOver={(value, {index}) => this.setState({crosshairValues:value,index:colorData.indexOf(value)})}
              // onValueMouseOut={() => this.setState({crosshairValues:null,index:null})}
              data={colorData}
              style={{cursor: 'pointer'}}
            />
            <YAxis position="start" tickSize={2} tickFormat={v => `${v.substring(0,9)+(v.length > 10 ? '...': '')}`} style={{ 
              line: {stroke: '#333', strokeWidth:1},
              ticks: {fontSize:'9px'},
              text: {stroke: 'none', fill: '#333', fontWeight: 300}}}/>
            <XAxis tickSize={0} orientation={'top'} style={{line: {strokeWidth: 0},
              ticks: {stroke: '#ADDDE1',fontSize:'9px'},
              text: {stroke: 'none', fill: '#333', fontWeight: 200}}}/>
            {
              this.state.crosshairValues !== null && 
              <Hint value={this.state.crosshairValues}>
                <div className="triangle" style={{backgroundColor:'#ebebeb', color:'#333', fontSize:'10px',padding: '5px'}}>
                  <p className="hint"><b>{this.state.crosshairValues.y}</b></p>
                  <hr/>
                  <p className="hint"><b>Count: </b>{commas(this.state.crosshairValues.x)}</p>
                </div>
              </Hint>
            }
  
          </FlexibleWidthXYPlot>
        </div>
      );
    }
  }
  
export class Histogram extends Component {
    constructor(props) {
      super(props);
      this.state = {
        crosshairValues: null,
        index: null
      };
    }
  
    mouseOut() {
      this.setState({crosshairValues:null, index:null})
    }
  
    mouseOver(datapoint) {
      this.setState({crosshairValues:datapoint})
    }
  
    render() {
  
      function formatNum(value, index, scale, tickTotal) {
        if (scale.domain()[1] < 2) {
          if (index === tickTotal) {
            return `${scale.tickFormat(tickTotal, '.1%')(value)}+`
          } else {
            return `${scale.tickFormat(tickTotal, '.1%')(value)}`
          }
        } else if (scale.domain()[0] > 1500 && scale.domain()[1] < 2100) {
          if (index === tickTotal) {
            return `${value}+`
          } else {
            return `${value}`
          }
        } else {
          if (index === tickTotal) {
            return `${scale.tickFormat(tickTotal, '.1s')(value)}+`.replace(/G/,"B")
          } else {
            return `${scale.tickFormat(tickTotal, '.1s')(value)}`.replace(/G/,"B")
          }
        }
      }
  
      const inputData = this.props.inputData  
      console.log(inputData)    
      const field = this.props.field
      console.log(field)
      var values= inputData.map(feature => {return feature.properties[field]}).sort(d3.ascending)
      // var values= permits.features.map(feature => {return feature.properties.TotalSqFt}).sort(d3.ascending)
  
  
  
      var d = d3.scaleLinear()
      .domain([0, 1])
      .range([0,values.length]);
  
      var quantile = values.length < 20 ? 1 : values.length < 100 ? .95 : values.length < 1000 ? .98 : values.length < 10000 ? .995 : .9995
      const removeIdx = Math.ceil(d(quantile))
  
      const length = values.length
      const sliceLng = length-removeIdx
      var spliced = values.splice(removeIdx,sliceLng)
  
      const std = d3.deviation(values)
      const median = d3.median(values)
      const max = d3.max(values)
      const min = d3.min(values)
  
      var type 
      if (max < 2050 && min > 1500) {
        type = 'year'
      } else if (max < 1) {
        type = 'percentage'
      } else {
        type = 'number'
      }
      const stdRng = (max-median)/std
      var numBins = stdRng < 5 ? 20 : stdRng < 10 ? 40 : 80
  
      const set = new Set(values);
      if (set.size < numBins) {
        numBins = set.size
      }
      const extent = d3.extent(values)
  
  
      var x  = d3.scaleLinear()
      .domain(extent)
      .nice()
  
      var hist = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(numBins));
  
      console.log(hist.thresholds())
  
      var range = x.domain()
      var bins = hist((values))
  
      const data = bins.map((bin,index) => {return {x0: bin['x0'], x: bin['x1'], y:bin.length}})
      const step = data[0]['x']-data[0]['x0']
  
      var numTicks = data.length <= 10 ? data.length : data.length <= 20 ? data.length/2 : 10 
      
      for (var g of spliced) {
        var lastItem = data[data.length-1]
        lastItem['x'] = lastItem['x0']+step
        if (g < lastItem['x']) {
          for (var m of data) {
            if (g < m['x'] && g > m['x0']) {
              m['y'] += 1
              break
            }
          } 
        } else {
          lastItem['y'] += 1
        } 
      }
  
      const {index} = this.state;
      const colorData = data.map((d, i) => ({...d, color: i === index ? 1 : 0}));
      console.log(data)
  
      return (
          <FlexibleWidthXYPlot
            // onMouseLeave={() => this.setState({crosshairValues:null,index:null})}
            colorDomain={[0, 1]}
            height={200}
            margin={this.props.margin}>
            {this.props.gridlines !== false && 
              <HorizontalGridLines />
            }
            <VerticalRectSeries style={this.props.barStyle}
              onValueMouseOver={(value, {index}) => this.setState({crosshairValues:value,index:colorData.indexOf(value)})}
              data={colorData} 
            />
            {this.props.XAxis !== false && 
              <div>
                <XAxis tickSize={2} tickTotal={data.length} tickFormat={(value) => ''} style={{
                  line: {stroke: '#333', strokeWidth:.25}}}/>
                <XAxis tickSize={4} tickLabelAngle={-45} tickTotal={numTicks} tickFormat={(value, index, scale) => formatNum(value, index, scale, scale.ticks().length-1)}
                  style={{
                    line: {stroke: '#333', strokeWidth:.5},
                    ticks: {stroke: '#ADDDE1',fontSize:'9px'},
                    text: {stroke: 'none', fill: '#6b6b76', fontWeight: 400}}}/>
                <XAxis tickSize={0} tickTotal={0} 
                  style={{
                    line: {stroke: '#333', strokeWidth:1}}}/>
              </div>
            }
            {this.props.YAxis !== false && 
            <YAxis tickSize={0} 
              style={{line: {strokeWidth: 0},
                ticks: {stroke: '#ADDDE1',fontSize:'9px'},
                text: {stroke: 'none', fill: '#6b6b76', fontWeight: 200}}}/>
            }
            {
              this.props.hint !== false && this.state.crosshairValues !== null && 
              <Hint value={this.state.crosshairValues}>
                <div className="triangle" style={{backgroundColor:'#ebebeb', color:'#333', fontSize:'10px',padding: '5px'}}>
                  <p className="hint"><b>{formatNum(this.state.crosshairValues.x0,this.state.index,x,data.length-1)+(this.state.index !== data.length-1 ? ' - '+formatNum(this.state.crosshairValues.x,this.state.index,x,data.length-1) : '')}</b></p>
                  <hr/>
                  <p className="hint"><b>Count: </b>{commas(this.state.crosshairValues.y)}</p>
                </div>
              </Hint>
            }
          </FlexibleWidthXYPlot>
      );
    }
  }