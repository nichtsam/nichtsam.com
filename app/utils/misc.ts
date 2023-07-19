export const sleep = (ms: number) =>
  new Promise<void>((res) => setTimeout(() => res(), ms));
