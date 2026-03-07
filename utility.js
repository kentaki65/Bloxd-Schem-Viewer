const chunkSize = 16;
export function readVarInt(buf, offsetObj){
  let num = 0;
  let shift = 0;

  while(true){
    const byte = buf[offsetObj.offset++];
    num |= (byte & 0x7F) << shift; 
    if((byte & 0x80) === 0)break;
    shift += 7;
  }
  return num;
}

export function decodeChunkBlocks(buf){
  const offset = {offset:0}
  const blocks = []

  while(offset.offset < buf.length){
    const count = readVarInt(buf, offset)
    const block = readVarInt(buf, offset)
    for(let i=0;i<count;i++)blocks.push(block)
  }

  return blocks
}
export function expandChunk(chunk){
  const blocks = decodeChunkBlocks(chunk.blocks)
  const result = []
  let i = 0
  for(let y=0;y<chunkSize;y++){
    for(let z=0;z<chunkSize;z++){
      for(let x=0;x<chunkSize;x++){
        const block = blocks[i++]
        result.push({
          x: chunk.x*chunkSize + x,
          y: chunk.y*chunkSize + y,
          z: chunk.z*chunkSize + z,
          block
        })
      }
    }
  }
  return result
};
