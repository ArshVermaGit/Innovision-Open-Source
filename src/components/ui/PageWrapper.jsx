"use client";
import { useRef, useEffect, useState } from "react";

// Reusable page background with gradient blobs
export const PageBackground = ({ variant = "default" }) => {
  const variants = {
    default: (
      <>
        <div className="fixed top-0 left-1/4 w-100 h-100 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 right-1/4 w-87.5 h-87.5 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      </>
    ),
    premium: (
      <>
        <div className="fixed top-0 left-1/4 w-100 h-100 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 right-1/4 w-87.5 h-87.5 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      </>
    ),
    courses: (
      <>
        <div className="fixed top-0 right-1/4 w-100 h-100 bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-1/4 left-0 w-87.5 h-87.5 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      </>
    ),
    profile: (
      <>
        <div className="fixed top-1/4 left-0 w-100 h-100 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-87.5 h-87.5 bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />
      </>
    ),
  };

  return <div className="fixed inset-0 overflow-hidden z-0">{variants[variant] || variants.default}</div>;
};

// Grid pattern overlay - visible in both light and dark mode
export const GridPattern = ({ opacity = 0.05 }) => (
  <>
    {/* Light mode grid */}
    <div
      className="fixed inset-0 pointer-events-none z-0 dark:hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,${opacity}) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}
    />
    {/* Dark mode grid */}
    <div
      className="fixed inset-0 pointer-events-none z-0 hidden dark:block"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}
    />
  </>
);

// Scroll reveal wrapper
export const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  direction = "up"
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  const getTransform = () => {
    if (isVisible) return "translate(0, 0) scale(1)";
    switch (direction) {
      case "up": return "translateY(30px)";
      case "down": return "translateY(-30px)";
      case "left": return "translateX(30px)";
      case "right": return "translateX(-30px)";
      case "scale": return "scale(0.95)";
      default: return "translateY(30px)";
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
      }}
    >
      {children}
    </div>
  );
};

// Stagger children animation - preserves flex/grid layout
export const StaggerChildren = ({
  children,
  className = "",
  staggerDelay = 80
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children) ? children.filter(Boolean).map((child, i) => (
        <div
          key={child?.key || i}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition: `opacity 0.4s ease-out ${i * staggerDelay}ms, transform 0.4s ease-out ${i * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      )) : children}
    </div>
  );
};

// Animated card hover effect
export const HoverCard = ({ children, className = "" }) => (
  <div className={`group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 ${className}`}>
    {children}
  </div>
);

// Page header with animation
export const PageHeader = ({
  title,
  description,
  icon: Icon,
  iconColor = "text-blue-500",
  badge,
  children
}) => (
  <ScrollReveal className="mb-12">
    <div className="flex flex-col items-start gap-4">
      {badge && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
          {badge}
        </div>
      )}
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`p-2 rounded-xl bg-muted ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">{title}</h1>
      </div>
      {description && (
        <p className="text-muted-foreground text-base sm:text-lg mt-1">{description}</p>
      )}
      {children}
    </div>
  </ScrollReveal>
);

// Floating action button with magnetic effect
export const FloatingButton = ({ children, className = "", onClick }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) * 0.2;
    const y = (e.clientY - centerY) * 0.2;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition:  "transform 0.2s ease-out",
        willChange: "transform",
      }}
    >
      {children}
    </button>
  );
};

export default PageBackground;