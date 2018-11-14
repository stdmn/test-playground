import React from 'react';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';

import TimeRangeSlider from 'components/3rd_party/time-range-slider/TimeRangeSlider';
import earthquakes from 'assets/json/earthquakes.json';
import {
  styleLayer,
  changeOverlayFilterValues,
  removeOverlayFilter,
  addOverlayFilter
} from 'actions/Actions';

const mapStateToProps = state => ({
  // layers: state.overlay.layers,
  active: state.overlay.active
});

const mapDispatchToProps = dispatch => ({
  onChangeOverlayFilterValues: (filter, layerName) =>
    dispatch(changeOverlayFilterValues(filter, layerName)),
  onRemoveOverlayFilter: (attribute, layerName) =>
    dispatch(removeOverlayFilter(attribute, layerName)),
  onAddOverlayFilter: (filter, layerName) => dispatch(addOverlayFilter(filter, layerName)),
  onStyleLayer: layerName => dispatch(styleLayer(layerName))
});

const inputData = earthquakes.features;
const field = 'Depth';
const values = inputData.map((feature, index) => {
  inputData[index].properties.TimeStamp = DateTime.fromFormat(
    feature.properties.DateTime,
    'yyyy/MM/dd HH:mm:ss.u'
  ).ts;
  return feature.properties;
});

// const extent = d3.extent(values);

class TimeSlider extends React.Component {
  constructor(props) {
    super(props);
    const { timeField } = this.props;
    this.state = {
      value: [timeField.min, timeField.max]
    };
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    const { timeField, active, onAddOverlayFilter } = this.props;
    onAddOverlayFilter({ name: timeField.attribute }, active);
  }

  onChange(value) {
    const {
      layer,
      timeField,
      onChangeOverlayFilterValues,
      onAddOverlayFilter,
      onStyleLayer,
      active
    } = this.props;

    if (layer.filter !== undefined) {
      const filterNames = Object.keys(layer.filter);
      const filters = layer.filter;

      if (timeField !== undefined) {
        if (filterNames.includes(timeField.attribute)) {
          const newFilter = {
            [timeField.attribute]: {
              ...filters[timeField.attribute],
              values: [value[0] / 1000, value[1] / 1000]
            }
          };
          onChangeOverlayFilterValues(newFilter, active);
          onStyleLayer(active);
        }
      }
    }
    this.setState({ value });
  }

  render() {
    const { timeField, layer } = this.props;
    console.log(timeField.min * 1000);
    console.log(timeField.max * 1000);
    // const { value } = this.state;
    return (
      <div
        style={{
          padding: '.25rem 1rem',
          width: 700,
          backgroundColor: '#fff',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
          position: 'absolute',
          right: '.5em',
          bottom: 20
        }}
      >
        {layer.filter !== undefined &&
          layer.filter[timeField.attribute] !== undefined && (
            <TimeRangeSlider
              domain={[timeField.min * 1000, timeField.max * 1000]}
              isEnlarged
              value={layer.filter[timeField.attribute].values.map(item => item * 1000)}
              data={values}
              field={field}
              onChange={this.onChange}
            />
          )}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimeSlider);
