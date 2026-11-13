import type { TDevice } from "@/types/peer.t";

interface BrowserSignature {
  label: string;
  tokens: string[];
}

// first match wins: Edge, Opera and Samsung Internet also carry "Chrome/" and "Safari/"
const BROWSERS: BrowserSignature[] = [
  { label: "Edge", tokens: ["Edg/", "EdgA/", "EdgiOS/"] },
  { label: "Opera", tokens: ["OPR/", "OPT/"] },
  { label: "Samsung Internet", tokens: ["SamsungBrowser/"] },
  { label: "Firefox", tokens: ["Firefox/", "FxiOS/"] },
  { label: "Chrome", tokens: ["Chrome/", "CriOS/"] },
  { label: "Safari", tokens: ["Safari/"] },
];

// Chrome freezes the model to "K"; Firefox puts "Mobile" or "Tablet" in its place
const GENERIC_ANDROID_MODELS = ["K", "Mobile", "Tablet"];

const describeBrowser = (userAgent: string): string =>
  BROWSERS.find((browser) =>
    browser.tokens.some((token) => userAgent.includes(token)),
  )?.label ?? "Browser";

const describeAndroid = (userAgent: string): string => {
  const model = /Android [\d.]+; ([^;)]+)/
    .exec(userAgent)?.[1]
    ?.replace(/^SAMSUNG /, "")
    .replace(/ Build\/.*$/, "")
    .trim();

  if (model && !GENERIC_ANDROID_MODELS.includes(model)) {
    return model;
  }
  return userAgent.includes("Mobile") ? "Phone" : "Tablet";
};

export const describeDevice = (
  userAgent: string,
  maxTouchPoints: number,
): TDevice => {
  const browser = describeBrowser(userAgent);

  if (userAgent.includes("iPhone")) {
    return { name: "iPhone", browser, system: "iOS" };
  }
  // iPadOS Safari sends a Mac user agent
  if (
    userAgent.includes("iPad") ||
    (userAgent.includes("Macintosh") && maxTouchPoints > 1)
  ) {
    return { name: "iPad", browser, system: "iPadOS" };
  }
  if (userAgent.includes("Android")) {
    return { name: describeAndroid(userAgent), browser, system: "Android" };
  }
  if (userAgent.includes("Windows")) {
    return { name: "PC", browser, system: "Windows" };
  }
  if (userAgent.includes("Macintosh")) {
    return { name: "Mac", browser, system: "macOS" };
  }
  if (userAgent.includes("CrOS")) {
    return { name: "Chromebook", browser, system: "ChromeOS" };
  }
  if (userAgent.includes("Linux")) {
    return { name: "PC", browser, system: "Linux" };
  }
  return { name: "Device", browser, system: "" };
};
