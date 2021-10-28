import React, { FC, useEffect, useState } from 'react';
import { getData, MapData } from '../utils/Util';
import { LayerGroup, useMap, useMapEvents } from 'react-leaflet';
import CustomGeoJson from './CustomGeoJson';
import { GeoJsonObject } from 'geojson';
import { geoJSON } from 'leaflet';

const GeoJsonLayer: FC = () => {
    const [mapData, setMapData] = useState<MapData>();

    useEffect(() => {
        const fetchData = async () => {
            const data: MapData = await getData();
            if (data) setMapData(data);
        };

        fetchData();
    }, []);

    return null;
};

export default GeoJsonLayer;
