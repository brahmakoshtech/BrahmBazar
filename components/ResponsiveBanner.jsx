'use client';

import React from 'react';

/**
 * ResponsiveBanner Component
 * 
 * Requirements:
 * 1. Banner must be full width (w-full).
 * 2. Height auto-adjusts based on image ratio (h-auto).
 * 3. No cropping (completely visible).
 * 4. No blank side space (image width fills container).
 */
const ResponsiveBanner = ({ src, alt = "Banner", className = "" }) => {
    return (
        <div className={`relative w-full overflow-hidden ${className}`}>
            {/* 
                img needs to be block to avoid inline gaps.
                w-full ensures it takes full width.
                h-auto ensures aspect ratio is preserved.
             */}
            <img
                src={src}
                alt={alt}
                className="w-full h-auto block"
            />
        </div>
    );
};

export default ResponsiveBanner;
