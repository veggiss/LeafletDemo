import { GeoJsonObject } from 'geojson';

const counties: { features: GeoData[] } = require('../geodata/fylker.json');
const municipalities: { features: GeoData[] } = require('../geodata/kommuner.json');

interface GeoData {
    geometry: GeoJsonObject;
    properties: {
        objtype: 'Fylke' | 'Kommune';
        navn: { navn: string }[];
        lokalid: string;
        fylkesnummer?: string;
        kommunenummer?: string;
    };
}

export interface Data {
    type: 'municipality' | 'county';
    population: number;
    geoData: GeoData;
    code: string;
    parent: {
        code: string;
        name: string;
    };
    cases: {
        total: number;
        new: {
            today: number;
            d14: number;
        };
    };
}

interface County {
    items: Data[];
}

interface Municipality extends County {
    parentCounty: string;
}

export interface MapData {
    county: County;
    municipality: Municipality[];
}

export const getAvgCases = (item: Data) => Math.round((item.cases.new.d14 / item.population) * 100000);

export const getColor = (avgCases: number) => {
    if (avgCases >= 600) return '#AF352C';
    else if (avgCases >= 300) return '#F44336';
    else if (avgCases >= 100) return '#FF6600';
    else if (avgCases >= 50) return '#FBA520';
    else if (avgCases >= 25) return '#FED79C';
    else if (avgCases > 0) return '#F4E5D2';
    else return '#F3F3F3';
};

export const getData = async (): Promise<MapData> => {
    try {
        const response = await (await fetch('https://redutv-api.vg.no/corona/v1/areas/country/map')).json();

        if (response) {
            const items: Data[] = response.items;
            const countyItems = items.filter((item) => item.type === 'county');
            const municipalityItems = items.filter((item) => item.type === 'municipality');

            return {
                county: {
                    items: countyItems.map((countyItem) => ({
                        ...countyItem,
                        geoData: counties.features.find(
                            (geoData) => geoData.properties.fylkesnummer === countyItem.code,
                        ),
                    })),
                },
                municipality: countyItems.map((countyItem) => {
                    const filteredItems = municipalityItems.filter(
                        (municipalityItem) => countyItem.code === municipalityItem.parent?.code,
                    );

                    return {
                        parentCounty: countyItem.code,
                        items: filteredItems.map((item) => ({
                            ...item,
                            geoData: municipalities.features.find(
                                (geoData) => item.code === geoData.properties.kommunenummer,
                            ),
                        })),
                    };
                }),
            };
        }
    } catch (e) {
        console.error(e);
    }
};
