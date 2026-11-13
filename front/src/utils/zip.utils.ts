import { zip, type AsyncZippable } from "fflate";

export const createZipFromFiles = (files: File[]): Promise<File> => {
  return new Promise((resolve, reject) => {
    Promise.all(
      files.map(async (file) => ({
        name: file.name,
        data: new Uint8Array(await file.arrayBuffer()),
      })),
    )
      .then((entries) => {
        const zippable: AsyncZippable = {};
        const usedNames = new Set<string>();
        for (const entry of entries) {
          let name = entry.name;
          let counter = 1;
          while (usedNames.has(name)) {
            const dot = entry.name.lastIndexOf(".");
            const base = dot > 0 ? entry.name.slice(0, dot) : entry.name;
            const ext = dot > 0 ? entry.name.slice(dot) : "";
            name = `${base} (${counter})${ext}`;
            counter++;
          }
          usedNames.add(name);
          zippable[name] = entry.data;
        }
        // fflate level 0 stores the entries without compression
        zip(zippable, { level: 0 }, (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          if (!(data.buffer instanceof ArrayBuffer)) {
            reject(new Error("Unexpected zip buffer"));
            return;
          }
          const blob = new Blob(
            [new Uint8Array(data.buffer, data.byteOffset, data.byteLength)],
            { type: "application/zip" },
          );
          const timestamp = new Date()
            .toISOString()
            .replace(/[:T]/g, "-")
            .slice(0, 19);
          const zipFile = new File(
            [blob],
            `drop-${files.length}-files-${timestamp}.zip`,
            { type: "application/zip" },
          );
          resolve(zipFile);
        });
      })
      .catch(reject);
  });
};
