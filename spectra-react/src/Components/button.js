import React from 'react';

function Button({ children, variant, onClick })
{
  const baseStyle = 'px-3 py-1 rounded';
  const variantStyle = variant === 'primary' ? 'bg-blue-600' : 'bg-gray-700';

    const handleButtonClick = () => {
        // Call the onClick method
        onClick();
    };

  return (
      <div className="inline-block relative">
        <button className={`${baseStyle} ${variantStyle}`} onClick={handleButtonClick}>
          {children}
        </button>
      </div>
  );
}

export default Button;