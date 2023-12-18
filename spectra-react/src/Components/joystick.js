import React from 'react';

function Joystick({ children, footer })
{
    return (
        <div className="joystick bg-purple-600 rounded inline-block relative cursor-pointer p-1">
            <span className="text-xs">Keyboard Joystick</span>
            <div className="flex items-center justify-center text-xs m-1 p-2 pt-6">
                {children}
            </div>
            {footer && (
                <div
                    className="relative -bottom-1 -right-1 text-white h-4 w-4 flex items-center justify-center text-xs mb-1">
                    #{footer}
                </div>
            )}
        </div>
    );
}

export default Joystick;