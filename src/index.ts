let buffer = Buffer.alloc(100);
buffer.writeInt8(66, 0);
console.log(buffer.length);
console.log(buffer.toString("utf-8").length);
