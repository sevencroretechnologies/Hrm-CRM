
import React from 'react';

const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
    return (
        <div
            className={`bg-secondary bg-opacity-25 rounded animate-pulse ${className || ''}`}
            style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
            {...props}
        />
    );
};

export default Skeleton;
