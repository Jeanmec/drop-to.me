export function removeElementFromStringArray(
  array: string[],
  element: string,
): string[] {
  const index = array.indexOf(element);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
}
