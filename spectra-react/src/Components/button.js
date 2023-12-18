import React from 'react';

function Button({ children, variant })
{
  const baseStyle = 'px-3 py-1 rounded';
  const variantStyle = variant === 'primary' ? 'bg-blue-600' : 'bg-gray-700';

  return (
      <div className="inline-block relative">
        <button className={`${baseStyle} ${variantStyle}`}>
          {children}
        </button>
      </div>
  );
}

export default Button;