import Link from "next/link";
import { env } from "@/env";
import { QuestionBoatKind } from "@/types/scene.t";
import QuestionFleet, {
  type FleetQuestion,
} from "@/components/LandingPage/QuestionFleet";
import VoyageChart from "@/components/LandingPage/VoyageChart";

export default function Informations() {
  const questions: FleetQuestion[] = [
    {
      value: "what-is-it",
      boat: QuestionBoatKind.CUTTER,
      title: `What is ${env.NEXT_PUBLIC_WEBSITE_NAME} ?`,
      content: (
        <>
          <p>
            This is a peer-to-peer file transfer application that allows you to
            send files or messages directly between devices on the same network.
          </p>
          <p>It is designed to be fast, secure, and easy to use.</p>
        </>
      ),
    },
    {
      value: "data-collection",
      boat: QuestionBoatKind.PERISCOPE,
      title: "What data are collected?",
      content: (
        <>
          <p>
            The server only handles what it needs to connect your devices: a
            random ID drawn by your browser, and your IP address, used to group
            you with the devices of your network. Neither is saved: they only
            live in the memory of the server. There is no cookie and no tracker.
          </p>
          <p>
            For statistics, it counts connections, messages and files, with the
            size of each file.{" "}
            {env.NEXT_PUBLIC_RELAY_URL
              ? "No server can read the files or messages you send."
              : "The content of the files or messages you send never reaches the server."}{" "}
            The{" "}
            <Link
              href="/terms"
              target="_blank"
              className="text-moon underline underline-offset-4"
            >
              terms of use
            </Link>{" "}
            give the details.
          </p>
        </>
      ),
    },
    {
      value: "security",
      boat: QuestionBoatKind.GALLEON,
      title: "Is it secure?",
      content: (
        <>
          <p>
            {env.NEXT_PUBLIC_RELAY_URL
              ? "Files and messages travel from browser to browser, encrypted from end to end: over WebRTC when the devices can reach each other, through a relay that cannot read them otherwise."
              : "Files and messages travel from browser to browser over WebRTC, which encrypts every connection."}{" "}
            Nothing you send is stored on our servers.
          </p>
          <p>
            Anyone on the same network, or anyone who has your room code, shows
            up as a connected device: they receive what you send and can send
            you files. Check who is connected before sending, and only open
            files you were expecting.
          </p>
        </>
      ),
    },
    {
      value: "like-airdrop",
      boat: QuestionBoatKind.AIRDROP,
      title: `Is it like AirDrop?`,
      content: (
        <>
          <p>
            It works similarly to AirDrop by enabling direct file transfers
            between devices on the same network without a central server.
          </p>
          <p>
            However, it is not limited to Apple devices and works across
            different platforms and operating systems.
          </p>
        </>
      ),
    },
    {
      value: "free-and-open-source",
      boat: QuestionBoatKind.COINS,
      title: "Is it free ?",
      content: env.NEXT_PUBLIC_GITHUB_URL ? (
        <p>
          Yes, this application is completely free and open-source. You can
          access the source code on
          <a
            href={env.NEXT_PUBLIC_GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-moon ml-1 underline underline-offset-4"
          >
            GitHub
          </a>
          .
        </p>
      ) : (
        <p>Yes, this application is completely free and open-source.</p>
      ),
    },
  ];

  return (
    <div
      className="grid gap-20 px-14 py-20 max-md:gap-14 max-md:px-4 max-md:py-14"
      id="informations"
    >
      <VoyageChart />
      <QuestionFleet questions={questions} />
    </div>
  );
}
