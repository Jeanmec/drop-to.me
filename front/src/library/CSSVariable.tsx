import { useEffect, useState } from "react";

export default function useCSSVariable(
  variableName: string,
  defaultValue = "",
): string {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    const cssVar = style.getPropertyValue(variableName).trim();
    setValue(cssVar);
  }, [variableName]);

  return value;
}
