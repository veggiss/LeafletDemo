-- 1.

	// App

	export const initialBounds = latLngBounds([
	    [71.7739410364347, 32.16796875000001],
	    [57.4922136667007, 3.2958984375000004],
	]);

    <MapContainer
        minZoom={5}
        maxZoom={10}
        whenCreated={(map) => map.fitBounds(initialBounds)}
        renderer={svg({ padding: 1 })}
    >
		<TileLayer
		    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
		/>
    </MapContainer>

-- 2.

	// CustomGeoJson

	return <GeoJSON data={item.geoData.geometry} />

	// GeoJsonLayer

	<LayerGroup>
	    {mapData &&
	        mapData.county.items.map((item) =>
	            item.geoData ? (
	                <CustomGeoJson
	                    key={item.code}
	                    item={item}
	                    onClick={() => console.log('hei')}
	                />
	            ) : null,
	        )}
	</LayerGroup>

-- 3.

	// CustomGeoJson

	const avgCases = getAvgCases(item);

	style={{
	    fillColor: getColor(avgCases),
	    weight: 1,
	    fillOpacity: 1,
	    color: 'white',
	}}

-- 4.

	// CustomGeoJson

	eventHandlers={{
	    click: onClick,
	    mouseover: (e) => {
	        e.target.setStyle({ color: 'black' });
	        e.target.bringToFront();
	    },
	    mouseout: (e) => {
	        e.target.setStyle({ color: 'white' });
	        e.target.bringToBack();
	    },
	}}

-- 5.

	// GeoJsonLayer

	const map = useMap();

	const fitCameraToBounds = (shape: GeoJsonObject) => {
	    const geoData = geoJSON(shape);
	    const bounds = geoData && geoData.getBounds();

	    if (bounds) map.fitBounds(bounds);
	};

	// CustomGeoJson

	onClick={() => fitCameraToBounds(item.geoData.geometry)}

-- 6.

	// CustomGeoJson

	const areaName = item.geoData.properties.navn[0].navn;

	onEachFeature={(feature, layer) => {
	    layer.bindTooltip(areaName, {
	        permanent: true,
	        direction: 'center',
	        className: 'labels',
	    });
	}}

	// map.css

	.leaflet-tooltip.labels {
	    background-color: transparent;
	    border: transparent;
	    box-shadow: none;
	}

-- 7.

	// GeoJsonLayer

	const [selectedCounty, setSelectedCounty] = useState<string>();

	onClick={() => {
	    fitCameraToBounds(item.geoData.geometry);
	    setSelectedCounty(item.geoData.properties.fylkesnummer);
	}}

-- 8.

	// GeoJsonLayer

	const selectedData = selectedCounty && mapData.municipality.find((item) => item.parentCounty === selectedCounty).items;
	
	{selectedData &&
	    selectedData.map((item) =>
	        item.geoData && item.code !== selectedCounty ? (
	            <CustomGeoJson
	                key={item.code}
	                item={item}
	                onClick={() => fitCameraToBounds(item.geoData.geometry)}
	            />
	        ) : null,
	    )}

-- 9.

	// CustomGeoJson

	<Tooltip sticky>
	    <h3>{areaName}</h3>
	    <table>
	        <tbody>
	            <tr>
	                <th />
	                <th>Siste 14 d.</th>
	                <th>Per 100k.</th>
	                <th>I dag</th>
	            </tr>
	            <tr>
	                <td>Reg. smittet</td>
	                <td>{item.cases.new.d14}</td>
	                <td>{avgCases}</td>
	                <td>{item.cases.new.today}</td>
	            </tr>
	        </tbody>
	    </table>
	</Tooltip>

-- 10.

	// GeoJsonLayer

	useMapEvents({
	    click: () => setSelectedCounty(null),
	});

	// CustomGeoJson

	bubblingMouseEvents={false}

-- 11.

	// App

	renderer={svg({ padding: 1 })}