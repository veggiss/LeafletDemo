import React, { FC } from 'react';
import { MapContainer } from 'react-leaflet';
import { svg } from 'leaflet';
import GeoJsonLayer from './components/GeoJsonLayer';
import { initialBounds } from './utils/Util';
import './css/map.css';

const App: FC = () => (
    <MapContainer
        minZoom={5}
        maxZoom={10}
        whenCreated={(map) => map.fitBounds(initialBounds)}
        renderer={svg({ padding: 1 })}
    >
        <GeoJsonLayer />
    </MapContainer>
);

export default App;
