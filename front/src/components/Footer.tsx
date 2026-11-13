import styles from "./Footer.module.css";

export default function Footer() {
  const authorUrl = process.env.NEXT_PUBLIC_AUTHOR_GITHUB_URL;
  const sourceUrl = process.env.NEXT_PUBLIC_GITHUB_URL;

  return (
    <footer className={styles.shore}>
      <div className="text-ash text-label flex flex-wrap justify-between gap-x-6 gap-y-2 font-mono">
        <span>
          Made by <b className="text-moon font-medium">CLAVERIE Jean</b>
        </span>
        <span className="flex flex-wrap gap-x-5.5 gap-y-2 max-md:gap-x-3.5">
          Free and open source
          {authorUrl && (
            <a
              href={authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream hover:text-moon"
            >
              My Github
            </a>
          )}
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream hover:text-moon"
            >
              Get the source code
            </a>
          )}
        </span>
      </div>
    </footer>
  );
}
