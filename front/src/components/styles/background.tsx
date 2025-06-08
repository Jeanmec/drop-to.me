const ConcentricCirclesBackground = () => {
  const spacing = 130;
  const radii = Array.from({ length: 12 }, (_, i) => (i + 1) * spacing);

  const verticalOffset = 128;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <svg
        className="h-full w-full"
        viewBox="0 0 2000 2000"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="2">
          {radii.map((r) => (
            <circle key={r} cx="1000" cy={1000 + verticalOffset} r={r} />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default ConcentricCirclesBackground;
