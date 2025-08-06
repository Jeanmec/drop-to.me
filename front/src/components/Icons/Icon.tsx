import { cn } from "@/library/utils";
import {
  FaCode,
  FaExclamation,
  FaRegFileImage,
  FaRegFilePdf,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { FiDatabase, FiMessageSquare, FiUser } from "react-icons/fi";
import React, { type ComponentType } from "react";
import IconConnect from "./Connect";
import { GoVideo } from "react-icons/go";
import { HiOutlineUpload } from "react-icons/hi";
import { DownloadLoopIcon } from "./DownloadLoopIcon";
import { TbArrowsTransferUpDown, TbBrandGithubFilled } from "react-icons/tb";
import IconCheck from "./Check";
import { RiFileTransferLine } from "react-icons/ri";
import { IoIosClose, IoIosInformationCircleOutline } from "react-icons/io";
import { IoChevronDown } from "react-icons/io5";
import { CiTrash } from "react-icons/ci";
import { LuSend } from "react-icons/lu";

type IconProps = {
  className?: string;
};

const createIcon = (Component: ComponentType<{ className?: string }>) => {
  const IconComponent = ({ className }: IconProps) => (
    <Component className={cn("text-white", className)} />
  );

  IconComponent.displayName = `Icon(${Component.displayName ?? Component.name ?? "Component"})`;

  return IconComponent;
};

export const Icon = {
  user: createIcon(FiUser),
  pdf: createIcon(FaRegFilePdf),
  connect: createIcon(IconConnect),
  video: createIcon(GoVideo),
  message: createIcon(FiMessageSquare),
  image: createIcon(FaRegFileImage),
  upload: createIcon(HiOutlineUpload),
  downloadAnimated: createIcon(DownloadLoopIcon),
  github: createIcon(TbBrandGithubFilled),
  check: createIcon(IconCheck),
  fileTransfer: createIcon(RiFileTransferLine),
  exchange: createIcon(TbArrowsTransferUpDown),
  information: createIcon(IoIosInformationCircleOutline),
  database: createIcon(FiDatabase),
  chevronDown: createIcon(IoChevronDown),
  trash: createIcon(CiTrash),
  exclamation: createIcon(FaExclamation),
  warning: createIcon(FaTriangleExclamation),
  send: createIcon(LuSend),
  close: createIcon(IoIosClose),
  code: createIcon(FaCode),
};
