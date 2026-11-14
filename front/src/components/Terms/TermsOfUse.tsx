import type { ReactNode } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { env } from "@/env";
import { iceServerHost } from "@/utils/ice.utils";

const UPDATED_ON = "14 November 2026";
const AUTHOR_NAME = "Jean Claverie";
const LICENSE_NAME = "MIT License";

const hostListFormatter = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

interface TermsSectionProps {
  title: string;
  children: ReactNode;
}

interface TermsTopicProps {
  title: string;
  children: ReactNode;
}

interface TermsLinkProps {
  href: string;
  children: ReactNode;
}

function TermsSection({ title, children }: TermsSectionProps) {
  return (
    <section className="grid gap-x-10 gap-y-4 md:grid-cols-4">
      <SectionHeading className="md:pt-1.5">{title}</SectionHeading>
      <div className="border-moon text-lead grid max-w-prose gap-4 border-l pl-5.5 leading-relaxed md:col-span-3">
        {children}
      </div>
    </section>
  );
}

function TermsTopic({ title, children }: TermsTopicProps) {
  return (
    <div className="grid gap-1.5">
      <h3 className="text-xl font-semibold italic">{title}</h3>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function TermsLink({ href, children }: TermsLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-moon underline underline-offset-4"
    >
      {children}
    </a>
  );
}

export default function TermsOfUse() {
  const siteName = env.NEXT_PUBLIC_WEBSITE_NAME;
  const sourceUrl = env.NEXT_PUBLIC_GITHUB_URL;
  const stunHosts = hostListFormatter.format(
    env.NEXT_PUBLIC_STUN_URLS.map(iceServerHost),
  );

  return (
    <article className="grid gap-14 px-14 pt-16 pb-20 max-md:gap-10 max-md:px-4 max-md:pt-10 max-md:pb-14">
      <header className="grid gap-4">
        <h1 className="text-5xl leading-none font-black italic max-md:text-4xl">
          Terms of use
        </h1>
        <p className="text-ash text-label font-mono">
          Last updated on {UPDATED_ON}
        </p>
        <p className="text-lead max-w-prose leading-relaxed">
          {siteName} is a free tool to send files and messages between your
          devices. This page says what you can expect from it, what it expects
          from you, and what happens to your data. Using {siteName} means you
          accept these terms.
        </p>
      </header>

      <TermsSection title="The service">
        <p>
          {siteName} connects the devices that open it from the same network, or
          that share a room code, so they can send each other files and
          messages. Files and messages travel straight from one browser to the
          other.
        </p>
        <p>
          It is made by {AUTHOR_NAME} and offered free of charge, with no
          account and no advertising.
        </p>
      </TermsSection>

      <TermsSection title="Your part">
        <p>
          You are responsible for what you send. Only share files you have the
          right to share, and do not use {siteName} for anything unlawful.
        </p>
        <p>
          Every device in your room receives what you send: the devices on your
          network, or anyone who has your room code. Check who is connected
          before you send, and only open files you were expecting.
        </p>
      </TermsSection>

      <TermsSection title="Your data">
        <p>
          {siteName} is built to know as little as possible about you. There is
          no account, no cookie and no tracker, and nothing it keeps can be
          linked to a person.
        </p>
        <TermsTopic title="What is kept">
          <p>
            Counters only, for the statistics shown on the home page: one entry
            per connection, per message and per file sent. An entry holds a date
            and, for a file, its size. It holds no name, no address, no
            identifier and no content.
          </p>
        </TermsTopic>
        <TermsTopic title="What only passes through">
          <p>
            Your IP address is used while you are connected, to group you with
            the devices of your network and to show it to you. The application
            does not record it.
          </p>
          <p>
            Your browser draws a random identifier each time the page loads. The
            server holds it in memory while you are connected and for up to an
            hour afterwards, so your device finds its place again after a
            network cut. The connection details browsers exchange to reach each
            other are relayed and never stored.
          </p>
        </TermsTopic>
        <TermsTopic title="What never reaches the server">
          <p>
            Your files and your messages. They go directly between browsers over
            WebRTC, which encrypts every connection.
          </p>
          {env.NEXT_PUBLIC_TURN_URL && (
            <p>
              When two devices cannot reach each other directly, their encrypted
              exchange goes through a relay server, which cannot read it.
            </p>
          )}
        </TermsTopic>
        <TermsTopic title="On your device">
          <p>
            The messages of an open chat are kept in the tab, so they survive a
            reload, and disappear when you close it. A received file stays in
            the memory of the browser until you close the page.
          </p>
        </TermsTopic>
        <TermsTopic title="Other parties">
          <p>
            To find a route between devices, your browser contacts public STUN
            servers ({stunHosts}), which see your IP address. The other devices
            in your room learn it too: a direct connection needs it.
          </p>
        </TermsTopic>
      </TermsSection>

      <TermsSection title="Open source">
        <p>
          The source code of {siteName} is public and released under the{" "}
          {LICENSE_NAME}. The libraries it relies on keep their own licenses.
        </p>
        {sourceUrl && (
          <p className="flex flex-wrap gap-x-6 gap-y-2">
            <TermsLink href={`${sourceUrl}/blob/HEAD/LICENSE`}>
              Read the license
            </TermsLink>
            <TermsLink href={sourceUrl}>Get the source code</TermsLink>
          </p>
        )}
      </TermsSection>

      <TermsSection title="No warranty">
        <p>
          {siteName} is provided as is, without warranty of any kind. A transfer
          can fail or be interrupted: keep a copy of what you send.
        </p>
        <p>
          To the extent the law allows, its author cannot be held liable for a
          loss of data or for any damage arising from the use of the service.
        </p>
      </TermsSection>

      <TermsSection title="Changes and contact">
        <p>
          These terms may change. The date at the top of this page tells when
          they last did.
        </p>
        {sourceUrl && (
          <p>
            For any question,{" "}
            <TermsLink href={`${sourceUrl}/issues`}>
              open an issue on GitHub
            </TermsLink>
            .
          </p>
        )}
      </TermsSection>
    </article>
  );
}
