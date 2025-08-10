export default function Hero() {
  return (
    <div className="flex w-full items-center justify-center pt-5 text-white">
      <div className="text-center">
        <h1 className="mb-4 p-2 backdrop-blur-xs">
          {process.env.NEXT_PUBLIC_WEBSITE_NAME}
        </h1>
        <p className="text-description mb-8 text-lg">
          Transfer files and messages anonymously
        </p>
      </div>
    </div>
  );
}
