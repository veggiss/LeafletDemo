import React, { FC } from 'react';
import { Data, getAvgCases, getColor } from '../utils/Util';
import { GeoJSON, Tooltip } from 'react-leaflet';
import '../css/table.css';

const CustomGeoJson: FC<{
    item: Data;
    onClick: () => void;
}> = ({ item, onClick }) => {
    return null;
};

export default CustomGeoJson;
