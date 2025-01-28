export const blobToBase64 = (blob: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (reader.result) {
        // Remove 'data:*/*;base64,' prefix.
        resolve(reader.result.toString().replace(/^data:[^/]*\/[^/]*;base64,/, ''));
      } else {
        reject(new Error('Error reading blob'));
      }
    };

    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
};
