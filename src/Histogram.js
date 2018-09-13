import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as d3 from 'd3';
// import {scaleLinear, scaleThreshold} from 'd3-scale';
import permits from './json/permits.json'
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries, VerticalGridLines, VerticalRectSeries} from 'react-vis';

class App extends Component {

  render() {

    function formatNum(value, index, scale, tickTotal) {
      if (scale.domain()[1] < 2) {
        if (index === scale.ticks().length-1) {
          return `${scale.tickFormat(tickTotal, '.1%"')(value)}+`
        } else {
          return `${scale.tickFormat(tickTotal, '.1%"')(value)}`
        }
      } else if (scale.domain()[0] > 1500 && scale.domain()[1] < 2100) {
        if (index === scale.ticks().length-1) {
          return `${value}+`
        } else {
          return `${value}`
        }
      } else {
        if (index === scale.ticks().length-1) {
          return `${scale.tickFormat(tickTotal, '.1s')(value)}+`.replace(/G/,"B")
        } else {
          return `${scale.tickFormat(tickTotal, '.1s')(value)}`.replace(/G/,"B")
        }
      }
    }

    console.log(permits)
    var values= permits.features.map(feature => {return feature.properties.PIN}).sort(d3.ascending)


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
    console.log(data)

    const axisStyle = {
      ticks: {
        fontSize: '14px',
        color: '#333'
      },
      title: {
        fontSize: '16px',
        color: '#333'
      }
    };

    return (
      <div className="App">
         <XYPlot
  width={300}
  height={250}>
  <HorizontalGridLines />
  <VerticalRectSeries data={data} style={{stroke: '#fff'}}/>
  <XAxis tickSize={2} tickTotal={data.length} tickFormat={(value) => ''} style={{
    line: {stroke: '#808080', strokeWidth:.5}}}/>
  <XAxis tickSize={4} tickLabelAngle={-45} tickTotal={numTicks} tickFormat={formatNum}
  style={{
    line: {stroke: '#808080', strokeWidth:.75},
    ticks: {stroke: '#ADDDE1',fontSize:'9px'},
    text: {stroke: 'none', fill: '#6b6b76', fontWeight: 400}}}/>
  <XAxis tickSize={0} tickTotal={0} style={{
    line: {stroke: '#333', strokeWidth:1.5}}}/>
  <YAxis tickSize={0} style={{line: {strokeWidth: 0},
      ticks: {stroke: '#ADDDE1',fontSize:'9px'},
      text: {stroke: 'none', fill: '#6b6b76', fontWeight: 200}}}/>
</XYPlot>
     

      </div>
    );
  }
}

export default App;
