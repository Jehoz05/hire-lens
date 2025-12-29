// types/pdfjs-dist.d.ts
declare module "pdfjs-dist/build/pdf.worker.mjs" {
  const workerSrc: string;
  export default workerSrc;
}

declare module "pdfjs-dist" {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };

  export function getDocument(parameters: any): {
    promise: Promise<any>;
  };

  // Add other pdfjs-dist exports you might need
}
