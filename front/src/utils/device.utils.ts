import { UAParser } from "ua-parser-js";
import type { TDevice } from "@/schemas/device.schema";

// the values are the names ua-parser-js reports
enum OperatingSystem {
  MAC_OS = "Mac OS",
  CHROMIUM_OS = "Chromium OS",
}

enum HandheldType {
  MOBILE = "mobile",
  TABLET = "tablet",
}

const IPAD_MODEL = "iPad";
const IPAD_SYSTEM = "iPadOS";
const MOBILE_BROWSER_PREFIX = "Mobile ";
// Chrome freezes the Android model to "K"
const GENERIC_MODELS = ["K"];

const describeSystem = (system: string | undefined): string => {
  switch (system) {
    case OperatingSystem.MAC_OS:
      return "macOS";
    case OperatingSystem.CHROMIUM_OS:
      return "ChromeOS";
    default:
      return system ?? "";
  }
};

const describeComputer = (system: string | undefined): string => {
  switch (system) {
    case undefined:
      return "Device";
    case OperatingSystem.MAC_OS:
      return "Mac";
    case OperatingSystem.CHROMIUM_OS:
      return "Chromebook";
    default:
      return "PC";
  }
};

const describeHandheld = (
  type: string | undefined,
  model: string | undefined,
): string | null => {
  const isNamed = model !== undefined && !GENERIC_MODELS.includes(model);

  switch (type) {
    case HandheldType.MOBILE:
      return isNamed ? model : "Phone";
    case HandheldType.TABLET:
      return isNamed ? model : "Tablet";
    default:
      return null;
  }
};

export const describeDevice = (
  userAgent: string,
  maxTouchPoints: number,
): TDevice => {
  const { browser, device, os } = new UAParser(userAgent).getResult();
  const browserName =
    browser.name?.replace(MOBILE_BROWSER_PREFIX, "") ?? "Browser";

  // iPadOS Safari sends a Mac user agent
  const isDesktopModeIpad =
    os.name === OperatingSystem.MAC_OS && maxTouchPoints > 1;
  if (isDesktopModeIpad || device.model === IPAD_MODEL) {
    return { name: IPAD_MODEL, browser: browserName, system: IPAD_SYSTEM };
  }

  return {
    name:
      describeHandheld(device.type, device.model) ?? describeComputer(os.name),
    browser: browserName,
    system: describeSystem(os.name),
  };
};
