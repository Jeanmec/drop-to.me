import { Icon } from "./Icons/Icon";

export default function Footer() {
  return (
    <footer className="container mx-auto mb-[100px]">
      <div className="top-0 left-0 z-[-1] h-[25px] w-full bg-gradient-to-t from-gray-800 to-black" />

      <div className="flex h-full w-full flex-col items-center justify-between gap-2 border-t-[1] border-white py-4 text-white md:flex-row">
        <span className="flex gap-1">
          Made by
          <span className="text-primary-blue font-bold">CLAVERIE Jean</span>
        </span>
        <div className="flex flex-col items-center gap-2 md:items-end md:gap-0">
          <a
            href="https://github.com/Jeanmec"
            target="_blank"
            className="group flex items-center gap-1"
          >
            My Github
            <Icon.github className="group-hover:text-primary-blue inline-block transition-all duration-200" />
          </a>

          <a
            href={process.env.NEXT_PUBLIC_GITHUB_URL}
            target="_blank"
            className="group flex items-center gap-1"
          >
            Get the source code
            <Icon.code className="group-hover:text-primary-blue inline-block transition-all duration-200" />
          </a>
        </div>
      </div>
    </footer>
  );
}
