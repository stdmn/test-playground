import React from "react";
// import * as d3 from "d3";
// import { DateTime } from "luxon";
import ReactMapboxGl from "react-mapbox-gl";
import lightStyle from "./json/LightStyle";
import accessToken from "./Token";
// import TimeRangeSlider from "./time-range-slider/time-range-slider";

// const inputData = earthquakes.features;
// const field = "DateTime";
// const values = inputData.map(
// 	feature => DateTime.fromFormat(feature.properties[field], "yyyy/MM/dd HH:mm:ss.u").ts
// );
// const extent = d3.extent(values);

const Map = ReactMapboxGl({
	accessToken, // Mapbox token, required for calling API
	preserveDrawingBuffer: true, // allows map to be printed
	hash: true, // creates a hash in the URL so user can send coordinates and zoom
	injectCss: false,
	logoPosition: "bottom-right",
	dragRotate: false,
	bearingSnap: 15,
	pitchWithRotate: false
});

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			zoom: [14],
			center: [-78.639132, 35.780321]
		};
		// this.onChange = this.onChange.bind(this);
	}

	// onChange(value) {
	// 	this.setState({ value });
	// }

	render() {
		const { center, zoom } = this.state;
		return (
			<Map
				className="main-map"
				style={lightStyle} // will eventually have dark version as well
				containerStyle={{
					height: "100vh",
					width: "100vw"
				}}
				onStyleLoad={this.onStyleLoad}
				center={center}
				zoom={zoom}
				// onClick={this.onMapClick}
				// onZoomEnd={mainMap => console.log(mainMap.getZoom())}
				// maxBounds={}
			/>
			// <div
			// 	style={{
			// 		padding: 30,
			// 		width: 1000,
			// 		backgroundColor: "#fff",
			// 		boxShadow: "0 1px 2px rgba(0, 0, 0, 0.25)"
			// 	}}
			// >
			// 	<TimeRangeSlider
			// 		domain={extent}
			// 		isEnlarged={true}
			// 		value={this.state.value}
			// 		data={values}
			// 		onChange={this.onChange}
			// 	/>
			// </div>
		);
	}
}
