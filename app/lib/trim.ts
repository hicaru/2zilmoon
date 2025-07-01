export function trim(str: string, len = 10) {
  const half = Math.floor(len / 2);
  return `${str.slice(0, half)}...${str.slice(str.length - half, str.length)}`;
}
