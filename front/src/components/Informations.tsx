import Accordion from "@/components/ui/Accordion";
import GlowingGrid from "./LandingPage/GlowingGrid";

export default function Informations() {
  const accordionItems = [
    {
      value: "what-is-it",
      title: `What is ${process.env.NEXT_PUBLIC_WEBSITE_NAME} ?`,
      content: (
        <span>
          This is a peer-to-peer file transfer application that allows you to
          send files or messages directly between devices on the same network
          without using a server. It is designed to be fast, secure, and easy to
          use.
        </span>
      ),
    },
    {
      value: "data-collection",
      title: "What data are collected?",
      content: (
        <span>
          We only collect the necessary data to establish a peer-to-peer
          connection into a temporary database, such as your device&#39;s peer
          ID and socket ID. No personal data is collected or stored. For
          statistical purposes, we may collect the file size, number of messages
          sent, and the number of users connected. The content of the files or
          messages you send is not stored or logged.
        </span>
      ),
    },
    {
      value: "free-and-open-source",
      title: "Is it free ?",
      content: (
        <span>
          Yes, this application is completely free and open-source. You can
          access the source code on
          <a
            href={process.env.NEXT_PUBLIC_GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-blue"
          >
            GitHub
          </a>
          .
        </span>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div
        className="container mx-auto flex flex-col items-center justify-center gap-16 px-12"
        id="informations"
      >
        <Accordion items={accordionItems} defaultValue={"what-is-it"} />
        <GlowingGrid />
      </div>
    </div>
  );
}
