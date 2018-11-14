import React from "react";
import ReactMapboxGl, { Source, Layer } from "react-mapbox-gl";
import lightStyle from "./json/LightStyle";
import accessToken from "./Token";

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

// ------------ Should only need to change the three fields marked with arrows directly below --------------

const sourceName = "parcels"; // <------- Change this to be the same as the Tippecanoe output
const layerType = "polygon"; // <------- One of: point, line, polygon

const source = (
	<Source
		id={sourceName}
		tileJsonSource={{
			type: "vector",
			tiles: ["http://d3j6wmy4pkup9n.cloudfront.net/tilesets/parcels/{z}/{x}/{y}.pbf"], // <-------- Address of tileset
			minzoom: 8,
			maxzoom: 14
		}}
	/>
);

// -------------- End editable section ----------------

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			zoom: [14],
			center: [-78.639132, 35.780321]
		};
	}

	render() {
		const { center, zoom } = this.state;
		let type = "fill";
		if (layerType === "point") {
			type = "circle";
		} else if (layerType === "line") {
			type = "line";
		}

		return (
			<Map
				className="main-map"
				style={lightStyle}
				containerStyle={{
					height: "100vh",
					width: "100vw"
				}}
				onStyleLoad={this.onStyleLoad}
				center={center}
				zoom={zoom}
			>
				{source}
				<Layer
					key={`${sourceName}-${type}`}
					id={`${sourceName}-${type}`}
					type={type} // <------ Change to: circle (points), line (line), heatmap (heatmap)
					sourceLayer={sourceName}
					sourceId={sourceName}
					paint={{ [`${type}-opacity`]: 0.7, [`${type}-color`]: "#e2312e" }}
				/>
			</Map>
		);
	}
}
