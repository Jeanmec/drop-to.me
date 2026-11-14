import {
  LuCircleAlert,
  LuDownload,
  LuInfo,
  LuRotateCw,
  LuSend,
  LuTriangleAlert,
  LuUpload,
  LuX,
} from "react-icons/lu";
import IconCheck from "./Check";
import DownloadLoopIcon from "./DownloadLoopIcon";

const Icon = {
  upload: LuUpload,
  downloadTray: LuDownload,
  downloadAnimated: DownloadLoopIcon,
  check: IconCheck,
  information: LuInfo,
  exclamation: LuCircleAlert,
  warning: LuTriangleAlert,
  send: LuSend,
  close: LuX,
  reload: LuRotateCw,
};

export default Icon;
