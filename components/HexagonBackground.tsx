import React from 'react';
import { SplineScene } from './ui/splite';
import { Spotlight } from './ui/spotlight';

const HexagonBackground = () => {
return (
    <div className="fixed inset-0 z-[-1] bg-black/[0.96] overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      <div className="absolute inset-0 w-full h-full">
        <SplineScene 
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default HexagonBackground;
