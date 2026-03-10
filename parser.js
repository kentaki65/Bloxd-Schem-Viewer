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
		{ name: "globalZ", type: "int", default: 0 }
	]
})

function parse(buffer) {

	console.log("========== BLOXDSCHEM DEBUG ==========")
	console.log("file size:", buffer.length)

	// header
	const header = buffer.readUInt32LE(0)
	console.log("header:", header)
	console.log("header raw:", buffer.slice(0,4))

	// 最初と最後を見る
	console.log("first 40 bytes:", buffer.slice(0,40))
	console.log("last 40 bytes:", buffer.slice(-40))

	const avroBuffer = buffer.slice(4)

	console.log("avro size:", avroBuffer.length)

	// schemaを順番に試す
	const schemas = [
		["schema3", schema3],
		["schema2", schema2],
		["schema1", schema1],
		["schema0", schema0]
	]

	for (const [name, schema] of schemas) {

		console.log("---- trying", name)

		try {

			const data = schema.fromBuffer(avroBuffer, undefined, true);
			console.log(name, "SUCCESS")
			console.log("keys:", Object.keys(data))

			return convertTo3D(data)

		} catch (e) {

			console.log(name, "FAILED:", e.message)
			console.log(
				buffer.slice(4, 200)
			)
			console.log(
				buffer.toString("utf8", buffer.length-200)
			)
			try {
				const data = schema.fromBuffer(avroBuffer, { noCheck:true })
				console.log(name, "PARTIAL SUCCESS (noCheck)")
				console.log("keys:", Object.keys(data))
				console.log(data)
			} catch (e2) {
				console.log(name, "noCheck failed:", e2.message)
			}
		}
	}

	throw new Error("No schema matched")
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