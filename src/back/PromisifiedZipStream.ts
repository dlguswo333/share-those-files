import ZipStream from 'zip-stream';

type EntryMethod = typeof ZipStream.prototype.entry;

/**
 * This is a wrapper class around zip-stream class.
 * Provide promisifed methods to evade callback-hell.
 */
class PromisifiedZipStream {
  zipStream: ZipStream;
  constructor () {
    this.zipStream = new ZipStream(/** options */);
  }

  /**
   * Return the zip stream as-is.
   */
  getZipStream () {
    return this.zipStream;
  }

  /**
   * Add an entry to the zip.
   * It returns a promise that will be resolved when the entry is fully consumed.
   */
  async entry (source: Parameters<EntryMethod>[0], data: Parameters<EntryMethod>[1]) {
    return new Promise((resolve, reject) => {
      // According to the internal library docs,
      // The callback will be called when the entry is fully consumed.
      this.zipStream.entry(source, data, (err, entry) => {
        if (err) {
          return reject(err);
        }
        resolve(entry);
      });
    });
  }

  /** Must-call method to signal the end of stream. */
  async finalize () {
    this.zipStream.finalize();
  }
}

export default PromisifiedZipStream;
