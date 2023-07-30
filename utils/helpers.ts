export function getBufferFromFile(file: File | Blob): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(Buffer.from(event.target.result as ArrayBuffer));
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export function getBlobFromFile(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(new Blob([event.target.result as ArrayBuffer]));
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Formats numbers to be more eloquent.
 *
 * Can be even more eloquent if you pass the eloquent parameter as true.
 * @param number
 * @param eloquent
 * @returns
 */
export function FormatNumber(
  number: number,
  eloquent: boolean = false,
): string | number {
  if (eloquent) {
    if (number < 1000) return number;
    if (number >= 1000 && number < 1000000)
      return (number / 1000).toFixed(1) + "k";
    if (number >= 1000000 && number < 1000000000)
      return (number / 1000000).toFixed(1) + "m";
  } else {
    return parseInt(number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  }

  return number;
}
