import React, { FC, useEffect, useState } from 'react';
import { LayerGroup, useMap, useMapEvents } from 'react-leaflet';
import CustomGeoJson from './CustomGeoJson';
import { getData, MapData } from '../utils/Util';
import { GeoJsonObject } from 'geojson';
import { geoJSON } from 'leaflet';

const GeoJsonLayer: FC = () => {
    const map = useMap();
    const [mapData, setMapData] = useState<MapData>();
    const [selectedCounty, setSelectedCounty] = useState<string>();
    const selectedData =
        selectedCounty && mapData.municipality.find((item) => item.parentCounty === selectedCounty).items;

    const fitCameraToBounds = (shape: GeoJsonObject) => {
        const geoData = geoJSON(shape);
        const bounds = geoData && geoData.getBounds();

        if (bounds) map.fitBounds(bounds);
    };

    useMapEvents({
        click: () => setSelectedCounty(null),
        moveend: () => console.log(map.getBounds()),
    });

    useEffect(() => {
        const fetchData = async () => {
            const data: MapData = await getData();
            if (data) setMapData(data);
        };

        fetchData();
    }, []);

    return (
        <LayerGroup>
            {mapData &&
                mapData.county.items.map((item) =>
                    item.geoData && item.code !== selectedCounty ? (
                        <CustomGeoJson
                            key={item.code}
                            item={item}
                            onClick={() => {
                                fitCameraToBounds(item.geoData.geometry);
                                setSelectedCounty(item.geoData.properties.fylkesnummer);
                            }}
                        />
                    ) : null,
                )}

            {selectedData &&
                selectedData.map((item) =>
                    item.geoData ? (
                        <CustomGeoJson
                            key={item.code}
                            item={item}
                            onClick={() => fitCameraToBounds(item.geoData.geometry)}
                        />
                    ) : null,
                )}
        </LayerGroup>
    );
};

export default GeoJsonLayer;
