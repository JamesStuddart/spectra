import React, { useEffect, useState } from 'react';
import Button from "./button";
import Key from "./key";
import Joystick from "./joystick";
import SpacerKey from "./spacerkey";
const { ipcRenderer } = window.require('electron');

function AzeronComponent() {
    const [azeronData, setAzeronData] = useState([]);
    const [hightlightedKey, setHightlightedKey] = useState();

    useEffect(() => {
        ipcRenderer.on('azeron-data', (event, data) => {
            setAzeronData(prevData => [...prevData, data]);
            setHightlightedKey(data.id); // Assume data.id is the id of the key to highlight

            // Reset highlightedKey after 2 seconds
            const timer = setTimeout(() => {
                setHightlightedKey(null);
            }, 2000);

            return () => {
                clearTimeout(timer);
                ipcRenderer.removeAllListeners('azeron-data');
            };
        });
    }, []);

    return (
        <div>
            <h3>Azeron Data</h3>
            <div className="bg-gray-800 text-white font-sans">
                <header className="flex justify-between items-center p-2">
                    <div className="grid grid-cols-2 gap-2">
                        {/*Profiles*/}
                        <Button variant="primary">Profile #1</Button>
                        <Button variant="secondary">Profile #2</Button>
                    </div>
                    <h1 className="text-2xl">Azeron Cyborg</h1>
                    <div></div>
                </header>

                <main className="flex justify-between items-center p-4">
                    <div></div>
                    <div className="grid grid-cols-8 gap-2 w-3/5">
                        <SpacerKey/>
                        <SpacerKey/>
                        <SpacerKey/>
                        <SpacerKey/>
                        <SpacerKey/>
                        <SpacerKey/>
                        <Key keyId={28} highlighted={hightlightedKey === 28}>N</Key>
                        <SpacerKey/>

                        <SpacerKey/>
                        <Key keyId={4} highlighted={hightlightedKey === 4}>F2</Key>
                        <Key keyId={8} highlighted={hightlightedKey === 8}>F1</Key>
                        <Key keyId={12} highlighted={hightlightedKey === 12}>R</Key>
                        <Key keyId={17} highlighted={hightlightedKey === 17}>9</Key>
                        <Key keyId={29} highlighted={hightlightedKey === 29}>Y</Key>
                        <Key keyId={22} highlighted={hightlightedKey === 22}>Esc</Key>
                        <Key keyId={31} highlighted={hightlightedKey === 31}>G</Key>

                        <SpacerKey/>
                        <Key keyId={3} highlighted={hightlightedKey === 3}>F2</Key>
                        <Key keyId={7} highlighted={hightlightedKey === 7}>F1</Key>
                        <Key keyId={11} highlighted={hightlightedKey === 11}>R</Key>
                        <Key keyId={16} highlighted={hightlightedKey === 16}>9</Key>
                        <SpacerKey/>
                        <Key keyId={30} highlighted={hightlightedKey === 30}>Caps</Key>
                        <SpacerKey/>

                        <Key keyId={36} highlighted={hightlightedKey === 36}>Q</Key>
                        <Key keyId={2} highlighted={hightlightedKey === 2}>1</Key>
                        <Key keyId={6} highlighted={hightlightedKey === 6}>2</Key>
                        <Key keyId={10} highlighted={hightlightedKey === 10}>3</Key>
                        <Key keyId={15} highlighted={hightlightedKey === 15}>4</Key>
                        <Key keyId={19} highlighted={hightlightedKey === 19}>E</Key>
                        <SpacerKey/>
                        <SpacerKey/>

                        <SpacerKey/>
                        <Key keyId={1} highlighted={hightlightedKey === 1}>Space</Key>
                        <Key keyId={5} highlighted={hightlightedKey === 5}>C</Key>
                        <Key keyId={9} highlighted={hightlightedKey === 9}>Shift</Key>
                        <Key keyId={14} highlighted={hightlightedKey === 14}>Ctrl</Key>
                        <SpacerKey/>
                        <SpacerKey/>
                        <SpacerKey/>

                        <SpacerKey/>
                        <Key keyId={37} highlighted={hightlightedKey === 37}>Tab</Key>
                        <Key keyId={38} highlighted={hightlightedKey === 38}>X</Key>
                        <Key keyId={13} highlighted={hightlightedKey === 13}>G</Key>
                        <Key keyId={18} highlighted={hightlightedKey === 18}>T</Key>
                        <SpacerKey/>

                        <Key keyId={23} highlighted={hightlightedKey === 23}>B</Key>
                        <Key keyId={20} highlighted={hightlightedKey === 20}>F</Key>


                        <div className="col-start-4 col-span-2">
                            <Joystick keyId={24}/>
                        </div>

                    </div>
                    <div></div>
                </main>
            </div>
        </div>
    );
}

export default AzeronComponent;
