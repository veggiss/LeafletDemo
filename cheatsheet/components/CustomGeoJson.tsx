import React, { FC } from 'react';
import { Data, getAvgCases, getColor } from '../../src/utils/Util';
import { GeoJSON, Tooltip } from 'react-leaflet';
import '../../src/css/table.css';

const CustomGeoJson: FC<{
    item: Data;
    onClick: () => void;
}> = ({ item, onClick }) => {
    const avgCases = getAvgCases(item);
    const areaName = item.geoData.properties.navn[0].navn;

    return (
        <GeoJSON
            bubblingMouseEvents={false}
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
            onEachFeature={(feature, layer) => {
                layer.bindTooltip(areaName, {
                    permanent: true,
                    direction: 'center',
                    className: 'labels',
                });
            }}
            style={{
                fillColor: getColor(avgCases),
                weight: 1,
                fillOpacity: 1,
                color: 'white',
            }}
            data={item.geoData.geometry}
        >
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
        </GeoJSON>
    );
};

export default CustomGeoJson;
