declare module 'ffbinaries' {
  type Progress = {
    progress: number;
  }

  export function downloadBinaries(
    modules: string[],
    options: {
      destination: string,
      tickerFn: (progress: Progress) => void,
    },
    callback: (error: string, installedPacks: string[]) => void
  ): void;
}