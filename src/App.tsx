import React, { FC } from 'react';
import { MapContainer } from 'react-leaflet';
import { svg } from 'leaflet';
import GeoJsonLayer from './components/GeoJsonLayer';
import { latLngBounds } from 'leaflet';
import './css/map.css';

const startBounds = latLngBounds([
    [71.7739410364347, 32.16796875000001],
    [57.4922136667007, 3.2958984375000004],
]);

const App: FC = () => (
    <MapContainer
        minZoom={5}
        maxZoom={10}
        whenCreated={(map) => map.fitBounds(startBounds)}
        renderer={svg({ padding: 1 })}
    >
        <GeoJsonLayer />
    </MapContainer>
);

export default App;
