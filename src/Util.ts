import { GeoJsonObject } from 'geojson';

const counties: { features: GeoData[] } = require('./geodata/fylker.json');
const municipalities: { features: GeoData[] } = require('./geodata/kommuner.json');

export interface GeoData {
    geometry: GeoJsonObject;
    properties: {
        objtype: 'Fylke' | 'Kommune';
        navn: [{ navn: string }];
        lokalid: string;
        fylkesnummer?: string;
        kommunenummer?: string;
    };
}

export interface Data {
    cases: {
        new: {
            today: number;
            yesterday: number;
            d7: number;
            d14: number;
        };
        total: number;
    };
    code: string;
    deaths: {
        new: {
            today: number;
            yesterday: number;
        };
        total: number;
        name: string;
    };
    parent: {
        code: string;
        name: string;
    };
    population: number;
    type: 'municipality' | 'county';
    geoData: GeoData;
}

export interface County {
    maxValue: number;
    items: Data[];
}

export interface Municipality extends County {
    parentCode: string;
}

export interface MapData {
    county: County;
    municipality: Municipality[];
}

interface Color {
    red: number;
    green: number;
    blue: number;
}

const colorGradient = (fadeFraction: number, rgbColor1: Color, rgbColor2: Color, rgbColor3: Color): string => {
    let color1 = rgbColor1;
    let color2 = rgbColor2;
    let fade = fadeFraction;

    if (rgbColor3) {
        fade = fade * 2;

        if (fade >= 1) {
            fade -= 1;
            color1 = rgbColor2;
            color2 = rgbColor3;
        }
    }

    const diffRed = color2.red - color1.red;
    const diffGreen = color2.green - color1.green;
    const diffBlue = color2.blue - color1.blue;

    const gradient = {
        red: parseInt(String(Math.floor(color1.red + diffRed * fade)), 10),
        green: parseInt(String(Math.floor(color1.green + diffGreen * fade)), 10),
        blue: parseInt(String(Math.floor(color1.blue + diffBlue * fade)), 10),
    };

    return 'rgb(' + gradient.red + ',' + gradient.green + ',' + gradient.blue + ')';
};
export const getColor = (weight: number) => {
    if (weight > 500) return '#AF352C';
    else if (weight > 200) return '#F44336';
    else if (weight > 100) return '#FF6600';
    else if (weight > 50) return '#FBA520';
    else if (weight > 25) return '#FED79C';
    else if (weight > 0) return '#F4E5D2';
    else return '#F3F3F3';
};
/*colorGradient(
        weight,
        { red: 224, green: 224, blue: 224 },
        { red: 255, green: 255, blue: 0 },
        { red: 153, green: 0, blue: 0 },
    );*/

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
            };
        }
    } catch (e) {
        console.log(e);
    }
};
