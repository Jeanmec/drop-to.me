import React from "react";

interface CarrouselProps {
  children: React.ReactNode;
}

export default function Carrousel({ children }: CarrouselProps) {
  return (
    <div className="carousel rounded-box w-screen">
      {React.Children.map(children, (child, index) => (
        <div className="carousel-item w-full" key={index}>
          {child}
        </div>
      ))}
    </div>
  );
}
