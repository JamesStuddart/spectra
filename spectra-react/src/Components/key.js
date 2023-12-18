import React, {useEffect, useState} from 'react';

function Key({children, keyId, highlighted}) {

    const [isHighlighted, setIsHighlighted] = useState(highlighted);

    useEffect(() => {
        // If highlighted is true, start the highlight effect
        if (highlighted === true) {
            setIsHighlighted(true);
            const timer = setTimeout(() => {
                setIsHighlighted(false); // After 2 seconds, remove the highlight
            }, 1000);
            return () => clearTimeout(timer); // Cleanup the timer on component unmount or if the effect reruns
        }else{
            setIsHighlighted(false);
        }
    }, [highlighted]);

    const keyStyle = isHighlighted ? 'highlighted-key' : 'bg-purple-600';

    return <div key={keyId} className={`key ${keyStyle} rounded inline-block relative cursor-pointer p-1 pt-8 transition duration-200 ease-out`}>
        <span className="absolute -top-0 -left-0 bg-cyan-500 rounded inline-block cursor-pointer m-1 p-1 h-1 w-1">
        </span>
        <div className="flex items-center justify-center text-xs m-1 p-2 pt-0">
            {children}
        </div>
        {keyId && (
            <div
                className="relative -bottom-1 -right-1 text-white h-4 w-4 flex items-center justify-center text-xs mb-1">
                #{keyId}
            </div>
        )}
    </div>;
}

export default Key;