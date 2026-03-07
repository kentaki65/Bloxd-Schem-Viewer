import avsc from 'https://cdn.jsdelivr.net/npm/avsc@5.7.9/+esm';
import { Buffer } from "https://cdn.jsdelivr.net/npm/buffer@6.0.3/+esm";
globalThis.Buffer = Buffer;

import { expandChunk } from './utility.js';

const schema = {
  type: "record",
  name: "Schematic",
  fields: [
    { name: 'headers', type: { type: 'fixed', size: 4 }, default: "\u{4}\u{0}\u{0}\u{0}" },
    { name: "name", type: "string" },
    { name: "x", type: "int" },
    { name: "y", type: "int" },
    { name: "z", type: "int" },
    { name: "sizeX", type: "int" },
    { name: "sizeY", type: "int" },
    { name: "sizeZ", type: "int" },
    {
      name: "chunks",
      type: {
        type: "array",
        items: {
          type: "record",
          fields: [
            { name: "x", type: "int" },
            { name: "y", type: "int" },
            { name: "z", type: "int" },
            { name: "blocks", type: "bytes" }
          ]
        }
      }
    },
    {
      name: "blockdatas",
      type: {
        type: "array",
        items: {
          type: "record",
          fields: [
            { name: "blockX", type: "int" },
            { name: "blockY", type: "int" },
            { name: "blockZ", type: "int" },
            { name: "blockdataStr", type: "string" }
          ]
        }
      },
      default: []
    },
    { name: "globalX", type: "int", default: 0 },
    { name: "globalY", type: "int", default: 0 },
    { name: "globalZ", type: "int", default: 0 },
    { name: 'wtvthisis', type: { type: 'fixed', size: 2 }, default: "\u{0}\u{0}" },
  ]
}

const type = avsc.Type.forSchema(schema);
const input = document.getElementById("fileInput");
const attached = document.getElementById("attached");
attached.onclick = () => input.click();

input.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) {
    console.error("invaild file");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const bytes = Buffer.from(reader.result);

      const result = type.decode(bytes, 0);
      const schem = result.value;
      const world = []
      for(const chunk of schem.chunks){
        const blocks = expandChunk(chunk)
        world.push(...blocks)
      }

      console.log(world);
    } catch (e) {
      console.error(e);
    }
  };
  reader.readAsArrayBuffer(file);
})
