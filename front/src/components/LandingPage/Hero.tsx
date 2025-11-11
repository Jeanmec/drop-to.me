export default function Hero() {
  return (
    <div className="absolute z-2 flex w-full items-center justify-center pt-5">
      <div className="my-4 px-4 text-center">
        <div className="rounded-full backdrop-blur-xs">
          <h1 className="text-primary-shadow mb-4 p-2 text-white">
            {process.env.NEXT_PUBLIC_WEBSITE_NAME}
          </h1>
        </div>
        <span className="text-description mb-8 text-lg">
          Share large files over your local network with peer-to-peer
          technology.
        </span>
      </div>
    </div>
  );
}
