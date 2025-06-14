import { useEffect, useState } from "react";

export const ConcentricCirclesBackground = () => {
  const spacing = 70;
  const radii = Array.from({ length: 20 }, (_, i) => (i + 1) * spacing);

  const [dimensions, setDimensions] = useState({
    width: 2000,
    height: 2000,
  });

  useEffect(() => {
    const updateSize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height * 0.675; // 67.5vh

  return (
    <div className="animate-fade-in pointer-events-none absolute inset-0 z-0 overflow-hidden bg-gradient-to-t from-black to-stone-800 transition-all duration-1000">
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <g fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2">
          {radii.map((r) => (
            <circle key={r} cx={centerX} cy={centerY} r={r} />
          ))}
        </g>
      </svg>
      <div
        className="absolute bottom-0 h-24 w-full backdrop-blur-md"
        style={{
          maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, transparent 100%)",
        }}
      ></div>
    </div>
  );
};
