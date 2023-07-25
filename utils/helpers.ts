

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