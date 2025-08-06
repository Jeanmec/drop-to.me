import FileTransfer from "@/components/Forms/FileTransfer/FileTransfer";
import Chat from "@/components/Forms/Chat/Chat";
import { BackgroundCircle } from "@/components/Background/BackgroundCircle";
import { Icon } from "@/components/Icons/Icon";
import BackgroundBeams from "@/components/Background/BackgroundBeams";

export type Page = {
  text: string;
  action: "set" | "goto";
  content?: React.ReactNode;
  background?: React.ReactNode;
  goto?: string;
  icon: React.ReactNode;
};

export const pages: Record<string, Page> = {
  file: {
    text: "File",
    action: "set",
    content: <FileTransfer />,
    background: <BackgroundCircle />,
    icon: <Icon.fileTransfer />,
  },
  message: {
    text: "Chat",
    action: "set",
    content: <Chat />,
    background: <BackgroundBeams />,
    icon: <Icon.message />,
  },
  informations: {
    text: "Informations",
    action: "goto",
    goto: "#informations",
    icon: <Icon.information />,
  },
};
