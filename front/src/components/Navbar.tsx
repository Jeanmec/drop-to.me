import Tabs from "@/components/Tabs";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { CiFileOn } from "react-icons/ci";
import Chat from "./Forms/Chat";
import FileTransfer from "./Forms/FileTransfer";

export default function Navbar() {
  return (
    <>
      <div className="fixed flex h-24 w-full items-center justify-center">
        <div className="rounded-full border-2 border-white px-4 py-2 backdrop-blur-xl">
          <Tabs
            labels={[
              {
                label: "File transfer",
                icon: <CiFileOn />,
                content: <FileTransfer />,
              },
              {
                label: "Chat",
                icon: <IoChatbubbleEllipsesOutline />,
                content: <Chat />,
              },
            ]}
          />
        </div>
      </div>
    </>
  );
}
