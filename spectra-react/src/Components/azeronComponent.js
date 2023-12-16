import React, { useEffect, useState } from 'react';
const { ipcRenderer } = window.require('electron');

function AzeronComponent() {
    const [azeronData, setAzeronData] = useState([]);

    useEffect(() => {
        ipcRenderer.on('azeron-data', (event, data) => {
            setAzeronData(prevData => [...prevData, data]);
        });

        return () => {
            ipcRenderer.removeAllListeners('azeron-data');
        };
    }, []);

    return (
        <div>
            <h3>Azeron Data</h3>
            <ul>
                {/* Map over the azeronData array and render each entry */}
                {azeronData.map((entry, index) => (
                    <li key={index}>
                        <strong>Key #{entry.id}:</strong> {entry.type} {entry.controllerType === "JOY" ? `X:${entry.x} Y:${entry.y}` : ''}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AzeronComponent;
