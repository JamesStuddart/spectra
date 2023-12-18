import React from 'react';

function SpacerKey({}) {
    return <div className="key  inline-block relative cursor-pointer p-1">
        <div className="flex items-center justify-center text-xs m-1 p-2 pt-6">
        </div>

            <div
                className="relative -bottom-1 -right-1 text-white h-4 w-4 flex items-center justify-center text-xs mb-1">
            </div>
    </div>;
}

export default SpacerKey;