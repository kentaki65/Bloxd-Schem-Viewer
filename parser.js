// Copyright (c) 2025 hansdiewurst

//Read and write .bloxdschem files, mainly using avsc
const { Buffer } = require("buffer");
const avsc = require("avsc");

const schema0 = avsc.Type.forSchema({
	type: "record",
	name: "Schematic",
	fields: [
		{ name: 'headers', type: { type: 'fixed', size: 4 }, default: "\u{0}\u{0}\u{0}\u{0}" },
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
		}
	]
});
const schema1 = avsc.Type.forSchema({
	type: "record",
	name: "Schematic",
	fields: [
		{ name: 'headers', type: { type: 'fixed', size: 4 }, default: "\u{1}\u{0}\u{0}\u{0}" },
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
			}
		}
	]
});
const schema2 = avsc.Type.forSchema({
	type: "record",
	name: "Schematic",
	fields: [
		{ name: 'headers', type: { type: 'fixed', size: 4 }, default: "\u{1}\u{0}\u{0}\u{0}" },
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
			}
		},
		{ name: "globalX", type: "int" },
		{ name: "globalY", type: "int" },
		{ name: "globalZ", type: "int" }
	]
});
const schema3 = avsc.Type.forSchema({
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
});

function parse(buffer) {
	try {
		const data = schema3.fromBuffer(buffer);
		console.log("schema3");
		return convertTo3D(data);
	} catch {}

	try {
		const data = schema2.fromBuffer(buffer);
		console.log("schema2");
		return convertTo3D(data);
	} catch {}

	try {
		const data = schema1.fromBuffer(buffer);
		console.log("schema1");
		return convertTo3D(data);
	} catch {}

	try {
		const data = schema0.fromBuffer(buffer);
		console.log("schema0");
		return convertTo3D(data);
	} catch {}

	throw new Error("Unknown bloxdschem format");
}

function decodeBlocks(avroChunk) {
	let i = 0
	const blocks = []
	function decodeLEB128() {
		let shift = 0
		let value = 0

		while (true) {
			const byte = avroChunk.blocks[i++]
			value |= (byte & 127) << shift
			shift += 7
			if ((byte & 128) === 0) break
		}
		return value
	}
	while (i < avroChunk.blocks.length) {
		const amount = decodeLEB128()
		const id = decodeLEB128()
		for (let j = 0; j < amount; j++) {
			blocks.push(id)
		}
	}

	return blocks
}

function convertTo3D(avroJson) {
	const chunkSize = 32;
	const result = {
		name: avroJson.name,
		size: [avroJson.sizeX, avroJson.sizeY, avroJson.sizeZ],
		blocks: []
	}
	for (const chunk of avroJson.chunks) {
		const decoded = decodeBlocks(chunk)
		let i = 0
		for (let y = 0; y < chunkSize; y++) {
			for (let z = 0; z < chunkSize; z++) {
				for (let x = 0; x < chunkSize; x++) {
					const id = decoded[i++]
					if (id === 0) continue
					result.blocks.push({
						x: chunk.x + x,
						y: chunk.y + y,
						z: chunk.z + z,
						id
					})
				}
			}
		}
	}
	return result
}

module.exports = {
	parseBloxdschem: parse,
}