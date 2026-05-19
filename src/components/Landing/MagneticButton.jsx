"use client";
import { useRef, useState } from "react";

const MagneticButton = ({ children, className = "", strength = 0.08}) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) * strength;
    const y = (e.clientY - centerY) * strength;
    ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;

    ref.current.style.transform = "translate3d(0px, 0px, 0px)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        
        transition: "transform 0.2s ease-out",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
};

export default MagneticButton;
