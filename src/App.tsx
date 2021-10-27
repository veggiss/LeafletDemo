import React, { FC, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, GeoJSON, useMapEvents } from 'react-leaflet';
import { geoJSON, latLngBounds, LatLngExpression, Map as LeafletMap } from 'leaflet';
import { GeoJsonObject } from 'geojson';
import { getColor } from './Util';

interface GeoData {
    geometry: GeoJsonObject;
    properties: {
        objtype: 'Fylke' | 'Kommune';
        navn: [{ navn: string }];
        lokalid: string;
        fylkesnummer?: string;
        kommunenummer?: string;
    };
}

const counties: { features: GeoData[] } = require('./geodata/fylker.json');
const municipalities: { features: GeoData[] } = require('./geodata/kommuner.json');

interface Data {
    cases: {
        new: {
            today: number; //0;
            yesterday: number; //218;
            d7: number; //1203;
            d14: number; //1835;
        };
        total: number; //56091;
    };
    code: string; //'0301';
    deaths: {
        new: {
            today: number; //0;
            yesterday: number; //0;
        };
        total: number; //101;
        name: string; //'Oslo';
    };
    parent: {
        code: string; //'03';
        name: string; //'Oslo';
    };
    population: number; //697010;
    type: 'municipality' | 'county';
    geoData: GeoData;
}

interface County {
    maxValue: number;
    items: Data[];
}

interface Municipality extends County {
    parentCode: string;
}

interface SelectedData {
    county: string;
    municipality: string;
    data: Municipality;
}

const percentage = (value: number, total: number) => value / total;

const App: FC = () => {
    const [zoomLevel, setZoomLevel] = useState(4);
    const [map, setMap] = useState<LeafletMap>();
    const [data, setData] = useState<{ county: County; municipality: Municipality[] }>();
    const [selectedData, setSelectedData] = useState<SelectedData>({
        county: null,
        municipality: null,
        data: null,
    });

    /*const MapEvents: FC = () => {
        const mapEvents = useMapEvents({
            zoomend: () => {
                setZoomLevel(mapEvents.getZoom());
            },
        });

        return null;
    };*/

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await (await fetch('https://redutv-api.vg.no/corona/v1/areas/country/map')).json();

                if (response) {
                    const items: Data[] = response.items;
                    const countyItems = items.filter((item) => item.type === 'county');
                    const municipalityItems = items.filter((item) => item.type === 'municipality');

                    setData({
                        county: {
                            items: countyItems.map((countyItem) => ({
                                ...countyItem,
                                geoData: counties.features.find(
                                    (geoData) => geoData.properties.fylkesnummer === countyItem.code,
                                ),
                            })),
                            maxValue: Math.max.apply(
                                Math,
                                countyItems.map((item) => item.cases.new.d14),
                            ),
                        },
                        municipality: countyItems.map((countyItem) => {
                            const filteredItems = municipalityItems.filter(
                                (municipalityItem) => countyItem.code === municipalityItem.parent?.code,
                            );

                            return {
                                parentCode: countyItem.code,
                                items: filteredItems.map((item) => ({
                                    ...item,
                                    geoData: municipalities.features.find(
                                        (geoData) => item.code === geoData.properties.kommunenummer,
                                    ),
                                })),
                                maxValue: Math.max.apply(
                                    Math,
                                    filteredItems.map((item) => item.cases.new.d14),
                                ),
                            };
                        }),
                    });
                }
            } catch (e) {
                console.log(e);
            }
        };

        getData();
    }, []);

    useEffect(() => {
        if (!data) return;

        const clickedData = data.municipality.filter((item) => item.parentCode === selectedData.county);

        console.log(clickedData);
    }, [setSelectedData]);

    /*
    <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
     */

    const fitCameraToBounds = (shape: GeoJsonObject) => {
        const geoData = geoJSON(shape);
        const bounds = geoData && geoData.getBounds();

        if (bounds) map.flyToBounds(bounds);
    };

    const CustomGeoJson: FC<{
        item: Data;
        maxValue: number;
        onClick: () => void;
    }> = ({ item, maxValue, onClick }) => {
        const isSelected = selectedData.municipality === item.code;
        return (
            <GeoJSON
                onEachFeature={(feature, layer) => {
                    layer.bindTooltip(item.geoData.properties.navn[0].navn, {
                        permanent: true,
                        direction: 'center',
                        className: 'labels',
                    });

                    layer.on({
                        click: onClick,
                        mousemove: (e) => {
                            if (!isSelected) e.target.setStyle({ color: 'black' });
                            e.target.bringToFront();
                        },
                        mouseout: (e) => {
                            if (!isSelected) {
                                e.target.setStyle({ color: 'white' });
                                e.target.bringToBack();
                            }
                        },
                    });
                }}
                style={{
                    fillColor: getColor(percentage(item.cases.new.d14, maxValue)),
                    weight: isSelected ? 2 : 1,
                    //stroke-width: to have a constant width on the screen need to adapt with scale
                    opacity: 1,
                    color: isSelected ? 'lightblue' : 'white',
                    fillOpacity: 0.6,
                }}
                data={item.geoData.geometry}
            />
        );
    };

    return (
        <div className="container">
            <MapContainer
                className="map-container"
                minZoom={4}
                maxZoom={10}
                whenCreated={(map: LeafletMap) => setMap(map)}
                bounds={latLngBounds([
                    [72.12793628105592, 33.70605468750001],
                    [56.92099675839107, -11.4697265625],
                ])}
            >
                {data &&
                    data.county.items.map((item) =>
                        item.geoData && item.code !== selectedData.county ? (
                            <CustomGeoJson
                                key={item.code}
                                item={item}
                                maxValue={data.county.maxValue}
                                onClick={() => {
                                    fitCameraToBounds(item.geoData.geometry);
                                    const selectedCode = item.geoData.properties.fylkesnummer;

                                    setSelectedData({
                                        municipality: null,
                                        county: selectedCode,
                                        data: data.municipality.find((item) => item.parentCode === selectedCode),
                                    });
                                }}
                            />
                        ) : null,
                    )}

                {selectedData.data &&
                    selectedData.data.items.map((item) =>
                        item.geoData ? (
                            <CustomGeoJson
                                key={item.code}
                                item={item}
                                maxValue={selectedData.data.maxValue}
                                onClick={() => {
                                    fitCameraToBounds(item.geoData.geometry);
                                    setSelectedData({ ...selectedData, municipality: item.code });
                                }}
                            />
                        ) : null,
                    )}
            </MapContainer>
        </div>
    );
};
export default App;
