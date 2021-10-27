import React, { FC, useEffect, useState } from 'react';
import { MapContainer, GeoJSON, Tooltip, TileLayer } from 'react-leaflet';
import { geoJSON, latLngBounds, Map as LeafletMap } from 'leaflet';
import { GeoJsonObject } from 'geojson';
import { Data, getColor, getData, MapData, Municipality } from './Util';
import './css/geojson.css';

interface SelectedData {
    county: string;
    municipality: string;
    data: Municipality;
}

const percentage = (value: number, total: number) => value / total;

const GeoJsonMap: FC = () => {
    const [zoomLevel, setZoomLevel] = useState(4);
    const [map, setMap] = useState<LeafletMap>();
    const [mapData, setMapData] = useState<MapData>();
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
        const fetchData = async () => {
            const data: MapData = await getData();

            if (data) setMapData(data);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!mapData) return;

        const clickedData = mapData.municipality.filter((item) => item.parentCode === selectedData.county);

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
        colorWeight: number;
        onClick: () => void;
    }> = ({ item, colorWeight, onClick }) => {
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
                    fillColor: getColor(colorWeight),
                    weight: 1,
                    opacity: 1,
                    color: isSelected ? 'black' : 'white',
                    fillOpacity: 0.6,
                }}
                data={item.geoData.geometry}
            >
                <Tooltip sticky>
                    <h3>{item.geoData.properties.navn[0].navn}</h3>
                    <table>
                        <tbody>
                            <tr>
                                <th></th>
                                <th>Siste 14 d.</th>
                                <th>Siste 7 d.</th>
                                <th>I dag</th>
                            </tr>
                            <tr>
                                <td>Reg. smittet</td>
                                <td>{item.cases.new.d14}</td>
                                <td>{item.cases.new.d7}</td>
                                <td>{item.cases.new.today}</td>
                            </tr>
                        </tbody>
                    </table>
                </Tooltip>
            </GeoJSON>
        );
    };

    return (
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
            {mapData &&
                mapData.county.items.map((item) => {
                    if (!item.geoData) return null;

                    const selectedCode = item.geoData.properties.fylkesnummer;
                    const filteredData = mapData.municipality.find((item) => item.parentCode === selectedCode);
                    const averageCases =
                        filteredData.items.reduce((a, b) => a + b.cases.new.d14, 0) / filteredData.items.length;

                    return item.code !== selectedData.county ? (
                        <CustomGeoJson
                            key={item.code}
                            item={item}
                            colorWeight={averageCases}
                            onClick={() => {
                                fitCameraToBounds(item.geoData.geometry);

                                setSelectedData({
                                    municipality: null,
                                    county: selectedCode,
                                    data: filteredData,
                                });
                            }}
                        />
                    ) : null;
                })}

            {selectedData.data &&
                selectedData.data.items.map((item) =>
                    item.geoData ? (
                        <CustomGeoJson
                            key={item.code}
                            item={item}
                            colorWeight={item.cases.new.d14}
                            onClick={() => {
                                fitCameraToBounds(item.geoData.geometry);
                                setSelectedData({ ...selectedData, municipality: item.code });
                            }}
                        />
                    ) : null,
                )}
        </MapContainer>
    );
};

export default GeoJsonMap;
