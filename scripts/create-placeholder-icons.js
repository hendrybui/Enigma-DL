/**
 * Creates properly-sized placeholder icon files for the extension.
 * Run with: node scripts/create-placeholder-icons.js
 *
 * For production icons, replace with your actual icon artwork.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const iconsDir = path.join(__dirname, '..', 'icons');

/**
 * Create a minimal solid-color PNG at the given dimensions.
 * Color: #667eea (the extension's brand purple-blue)
 */
function createPng(width, height) {
  const [r, g, b] = [0x66, 0x7e, 0xea];

  function chunk(name, data) {
    const c = Buffer.concat([Buffer.from(name), data]);
    const crc = crc32(c);
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([lenBuf, c, crcBuf]);
  }

  function crc32(buf) {
    let crc = -1;
    const table = makeCrcTable();
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  function makeCrcTable() {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[n] = c;
    }
    return table;
  }

  const sig = Buffer.from('\x89PNG\r\n\x1a\n', 'binary');

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type: RGB
  const ihdr = chunk('IHDR', ihdrData);

  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array(width).fill([r, g, b]).flat())]);
  const raw = Buffer.concat(Array(height).fill(row));
  const idat = chunk('IDAT', zlib.deflateSync(raw));

  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const sizes = [16, 32, 48, 128];
for (const size of sizes) {
  const outPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(outPath, createPng(size, size));
  console.log(`Created icons/icon${size}.png (${size}x${size})`);
}

console.log('Done. Replace these placeholder icons with your actual artwork for production.');
