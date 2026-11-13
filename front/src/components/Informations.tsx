import QuestionFleet, { type FleetQuestion } from "./LandingPage/QuestionFleet";
import VoyageChart from "./LandingPage/VoyageChart";

export default function Informations() {
  const questions: FleetQuestion[] = [
    {
      value: "what-is-it",
      boat: "cutter",
      title: `What is ${process.env.NEXT_PUBLIC_WEBSITE_NAME} ?`,
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
      boat: "periscope",
      title: "What data are collected?",
      content: (
        <>
          <p>
            We only collect the necessary data to establish a peer-to-peer
            connection into a temporary database, such as your device&#39;s peer
            ID and socket ID. No personal data is collected or stored.
          </p>
          <p>
            For statistical purposes, we may collect the file size, number of
            messages sent, and the number of users connected. The content of the
            files or messages you send is not stored or logged.
          </p>
        </>
      ),
    },
    {
      value: "security",
      boat: "galleon",
      title: "Is it secure?",
      content: (
        <>
          <p>
            Files and messages travel from browser to browser over WebRTC, which
            encrypts every connection. Nothing you send is stored on our
            servers.
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
      boat: "airdrop",
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
      boat: "coins",
      title: "Is it free ?",
      content: process.env.NEXT_PUBLIC_GITHUB_URL ? (
        <p>
          Yes, this application is completely free and open-source. You can
          access the source code on
          <a
            href={process.env.NEXT_PUBLIC_GITHUB_URL}
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
