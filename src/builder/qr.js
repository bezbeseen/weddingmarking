// Local byte-mode QR encoder (versions 1-10, ECC M). No network, no npm.

const EXP = new Uint8Array(256);
const LOG = new Uint8Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  EXP[255] = EXP[0];
}

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP[(LOG[a] + LOG[b]) % 255];
}

const ECC_M = {
  1: { data: 16, remainder: 0, blocks: [{ count: 1, data: 16, ec: 10 }] },
  2: { data: 28, remainder: 7, blocks: [{ count: 1, data: 28, ec: 16 }] },
  3: { data: 44, remainder: 7, blocks: [{ count: 1, data: 44, ec: 26 }] },
  4: { data: 64, remainder: 7, blocks: [{ count: 2, data: 32, ec: 18 }] },
  5: { data: 86, remainder: 7, blocks: [{ count: 2, data: 43, ec: 24 }] },
  6: { data: 108, remainder: 7, blocks: [{ count: 4, data: 27, ec: 16 }] },
  7: { data: 124, remainder: 0, blocks: [{ count: 4, data: 31, ec: 18 }] },
  8: {
    data: 154,
    remainder: 0,
    blocks: [
      { count: 2, data: 38, ec: 22 },
      { count: 2, data: 39, ec: 22 },
    ],
  },
  9: {
    data: 182,
    remainder: 0,
    blocks: [
      { count: 3, data: 36, ec: 22 },
      { count: 2, data: 37, ec: 22 },
    ],
  },
  10: {
    data: 216,
    remainder: 0,
    blocks: [
      { count: 4, data: 43, ec: 26 },
      { count: 1, data: 44, ec: 26 },
    ],
  },
};

const ALIGN = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
};

function versionSize(version) {
  return 21 + (version - 1) * 4;
}

function pushBits(bits, value, length) {
  for (let i = length - 1; i >= 0; i -= 1) {
    bits.push((value >>> i) & 1);
  }
}

function bitsToBytes(bits) {
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j += 1) {
      value = (value << 1) | (bits[i + j] || 0);
    }
    bytes.push(value);
  }
  return bytes;
}

function rsDivisor(degree) {
  const result = new Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < result.length; j += 1) {
      result[j] = gfMul(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = gfMul(root, 2);
  }
  return result;
}

function rsRemainder(data, divisor) {
  const result = divisor.map(() => 0);
  for (const byte of data) {
    const factor = byte ^ result[0];
    result.shift();
    result.push(0);
    for (let i = 0; i < result.length; i += 1) {
      result[i] ^= gfMul(divisor[i], factor);
    }
  }
  return result;
}

function addEccAndInterleave(data, version) {
  const spec = ECC_M[version];
  const blockDefs = [];
  for (const group of spec.blocks) {
    for (let i = 0; i < group.count; i += 1) {
      blockDefs.push({ data: group.data, ec: group.ec });
    }
  }

  let offset = 0;
  const dataBlocks = [];
  const ecBlocks = [];
  let maxData = 0;
  let maxEc = 0;
  for (const def of blockDefs) {
    const blockData = data.slice(offset, offset + def.data);
    offset += def.data;
    const ec = rsRemainder(blockData, rsDivisor(def.ec));
    dataBlocks.push(blockData);
    ecBlocks.push(ec);
    maxData = Math.max(maxData, blockData.length);
    maxEc = Math.max(maxEc, ec.length);
  }

  const out = [];
  for (let i = 0; i < maxData; i += 1) {
    for (const block of dataBlocks) {
      if (i < block.length) out.push(block[i]);
    }
  }
  for (let i = 0; i < maxEc; i += 1) {
    for (const block of ecBlocks) {
      if (i < block.length) out.push(block[i]);
    }
  }
  return out;
}

function encodeData(text, version) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const spec = ECC_M[version];
  const countBits = version <= 9 ? 8 : 16;
  const bits = [];
  pushBits(bits, 0b0100, 4);
  pushBits(bits, bytes.length, countBits);
  for (const byte of bytes) pushBits(bits, byte, 8);

  const capacityBits = spec.data * 8;
  const terminator = Math.min(4, capacityBits - bits.length);
  pushBits(bits, 0, terminator);
  while (bits.length % 8) bits.push(0);

  const data = bitsToBytes(bits);
  const pads = [0xec, 0x11];
  let padIndex = 0;
  while (data.length < spec.data) {
    data.push(pads[padIndex]);
    padIndex = 1 - padIndex;
  }
  return data;
}

function chooseVersion(text) {
  const bytes = new TextEncoder().encode(text);
  for (let version = 1; version <= 10; version += 1) {
    const countBits = version <= 9 ? 8 : 16;
    const needed = 4 + countBits + bytes.length * 8 + 4;
    if (Math.ceil(needed / 8) <= ECC_M[version].data) return version;
  }
  throw new Error("QR destination is too long for this local encoder (max ~200 characters).");
}

function makeGrid(size, fill = false) {
  return Array.from({ length: size }, () => Array(size).fill(fill));
}

function inFinder(row, col, size) {
  const inTopLeft = row < 9 && col < 9;
  const inTopRight = row < 9 && col >= size - 8;
  const inBottomLeft = row >= size - 8 && col < 9;
  return inTopLeft || inTopRight || inBottomLeft;
}

function placeFinder(modules, isFunction, row, col) {
  for (let r = -1; r <= 7; r += 1) {
    for (let c = -1; c <= 7; c += 1) {
      const rr = row + r;
      const cc = col + c;
      if (rr < 0 || cc < 0 || rr >= modules.length || cc >= modules.length) continue;
      const onRing = r === -1 || r === 7 || c === -1 || c === 7;
      const inCore = r >= 1 && r <= 5 && c >= 1 && c <= 5;
      const dark = (!onRing && (r === 0 || r === 6 || c === 0 || c === 6 || (inCore && r >= 2 && r <= 4 && c >= 2 && c <= 4)));
      modules[rr][cc] = dark;
      isFunction[rr][cc] = true;
    }
  }
}

function placeAlignment(modules, isFunction, version) {
  const positions = ALIGN[version];
  const size = modules.length;
  for (const row of positions) {
    for (const col of positions) {
      if (inFinder(row, col, size)) continue;
      for (let r = -2; r <= 2; r += 1) {
        for (let c = -2; c <= 2; c += 1) {
          const dark = r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0);
          modules[row + r][col + c] = dark;
          isFunction[row + r][col + c] = true;
        }
      }
    }
  }
}

function placeTimingAndDark(modules, isFunction) {
  const size = modules.length;
  for (let i = 8; i < size - 8; i += 1) {
    const dark = i % 2 === 0;
    modules[6][i] = dark;
    modules[i][6] = dark;
    isFunction[6][i] = true;
    isFunction[i][6] = true;
  }
  modules[size - 8][8] = true;
  isFunction[size - 8][8] = true;
}

function placeVersion(modules, isFunction, version) {
  if (version < 7) return;
  let rem = version;
  for (let i = 0; i < 12; i += 1) {
    rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  }
  const bits = (version << 12) | rem;
  const size = modules.length;
  for (let i = 0; i < 18; i += 1) {
    const dark = ((bits >> i) & 1) === 1;
    const a = size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    modules[a][b] = dark;
    modules[b][a] = dark;
    isFunction[a][b] = true;
    isFunction[b][a] = true;
  }
}

function formatBits(mask) {
  const data = (0b00 << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i += 1) {
    rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  }
  return ((data << 10) | rem) ^ 0x5412;
}

function placeFormat(modules, isFunction, mask) {
  const bits = formatBits(mask);
  const size = modules.length;
  const positionsA = [
    [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8],
    [8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  ];
  const positionsB = [];
  for (let i = 0; i <= 7; i += 1) positionsB.push([8, size - 1 - i]);
  for (let i = 8; i <= 14; i += 1) positionsB.push([size - 15 + i, 8]);

  for (let i = 0; i < 15; i += 1) {
    const dark = ((bits >> i) & 1) === 1;
    const [r1, c1] = positionsA[i];
    const [r2, c2] = positionsB[i];
    modules[r1][c1] = dark;
    modules[r2][c2] = dark;
    isFunction[r1][c1] = true;
    isFunction[r2][c2] = true;
  }
}

function maskBit(mask, row, col) {
  switch (mask) {
    case 0:
      return (row + col) % 2 === 0;
    case 1:
      return row % 2 === 0;
    case 2:
      return col % 3 === 0;
    case 3:
      return (row + col) % 3 === 0;
    case 4:
      return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5:
      return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6:
      return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    case 7:
      return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
    default:
      return false;
  }
}

function placeData(modules, isFunction, bytes, remainder) {
  const size = modules.length;
  const bits = [];
  for (const byte of bytes) pushBits(bits, byte, 8);
  for (let i = 0; i < remainder; i += 1) bits.push(0);

  let bitIndex = 0;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert += 1) {
      for (let j = 0; j < 2; j += 1) {
        const col = right - j;
        const upward = Math.floor((size - 1 - right) / 2) % 2 === 0;
        const row = upward ? size - 1 - vert : vert;
        if (isFunction[row][col] || bitIndex >= bits.length) continue;
        modules[row][col] = bits[bitIndex] === 1;
        bitIndex += 1;
      }
    }
  }
}

function applyMask(modules, isFunction, mask) {
  const size = modules.length;
  const next = modules.map((row) => row.slice());
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!isFunction[row][col] && maskBit(mask, row, col)) {
        next[row][col] = !next[row][col];
      }
    }
  }
  return next;
}

function penaltyScore(modules) {
  const size = modules.length;
  let score = 0;

  for (let row = 0; row < size; row += 1) {
    let run = 1;
    for (let col = 1; col <= size; col += 1) {
      if (col < size && modules[row][col] === modules[row][col - 1]) {
        run += 1;
      } else {
        if (run >= 5) score += 3 + (run - 5);
        run = 1;
      }
    }
  }

  for (let col = 0; col < size; col += 1) {
    let run = 1;
    for (let row = 1; row <= size; row += 1) {
      if (row < size && modules[row][col] === modules[row - 1][col]) {
        run += 1;
      } else {
        if (run >= 5) score += 3 + (run - 5);
        run = 1;
      }
    }
  }

  for (let row = 0; row < size - 1; row += 1) {
    for (let col = 0; col < size - 1; col += 1) {
      const dark = modules[row][col];
      if (
        dark === modules[row][col + 1] &&
        dark === modules[row + 1][col] &&
        dark === modules[row + 1][col + 1]
      ) {
        score += 3;
      }
    }
  }

  const pattern = [true, false, true, true, true, false, true];
  const hasFinder = (seq) => {
    for (let i = 0; i <= seq.length - 7; i += 1) {
      let match = true;
      for (let j = 0; j < 7; j += 1) {
        if (seq[i + j] !== pattern[j]) {
          match = false;
          break;
        }
      }
      if (!match) continue;
      const left = i >= 4 && seq.slice(i - 4, i).every((bit) => !bit);
      const right = i + 11 <= seq.length && seq.slice(i + 7, i + 11).every((bit) => !bit);
      if (left || right) score += 40;
    }
  };

  for (let row = 0; row < size; row += 1) hasFinder(modules[row]);
  for (let col = 0; col < size; col += 1) {
    hasFinder(modules.map((row) => row[col]));
  }

  let dark = 0;
  for (const row of modules) {
    for (const bit of row) if (bit) dark += 1;
  }
  const percent = (dark * 100) / (size * size);
  score += 10 * Math.floor(Math.abs(percent - 50) / 5);
  return score;
}

function cloneGrid(grid) {
  return grid.map((row) => row.slice());
}

export function encodeQrModules(text) {
  const value = String(text || "").trim() || "https://getbeseen.com/";
  const version = chooseVersion(value);
  const size = versionSize(version);
  const modules = makeGrid(size, false);
  const isFunction = makeGrid(size, false);

  placeFinder(modules, isFunction, 0, 0);
  placeFinder(modules, isFunction, 0, size - 7);
  placeFinder(modules, isFunction, size - 7, 0);
  placeTimingAndDark(modules, isFunction);
  placeAlignment(modules, isFunction, version);
  placeVersion(modules, isFunction, version);
  placeFormat(modules, isFunction, 0);

  const data = addEccAndInterleave(encodeData(value, version), version);
  placeData(modules, isFunction, data, ECC_M[version].remainder);

  const unmasked = cloneGrid(modules);
  let best = null;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask += 1) {
    const masked = applyMask(unmasked, isFunction, mask);
    placeFormat(masked, isFunction, mask);
    const score = penaltyScore(masked);
    if (score < bestScore) {
      bestScore = score;
      best = masked;
    }
  }
  return best;
}

export function qrSvg(text, { moduleSize = 6, margin = 4 } = {}) {
  const modules = encodeQrModules(text);
  const dim = (modules.length + margin * 2) * moduleSize;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" width="${dim}" height="${dim}" shape-rendering="crispEdges" role="img" aria-label="QR code">`,
    `<rect width="${dim}" height="${dim}" fill="#ffffff"/>`,
  ];
  for (let row = 0; row < modules.length; row += 1) {
    for (let col = 0; col < modules.length; col += 1) {
      if (!modules[row][col]) continue;
      const x = (col + margin) * moduleSize;
      const y = (row + margin) * moduleSize;
      parts.push(`<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="#111111"/>`);
    }
  }
  parts.push("</svg>");
  return parts.join("");
}

export function qrSvgDataUrl(text, options) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg(text, options))}`;
}

export function qrPngDataUrl(text, { moduleSize = 8, margin = 4 } = {}) {
  if (typeof document === "undefined") return "";
  const modules = encodeQrModules(text);
  const dim = (modules.length + margin * 2) * moduleSize;
  const canvas = document.createElement("canvas");
  canvas.width = dim;
  canvas.height = dim;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, dim, dim);
  ctx.fillStyle = "#111111";
  for (let row = 0; row < modules.length; row += 1) {
    for (let col = 0; col < modules.length; col += 1) {
      if (!modules[row][col]) continue;
      ctx.fillRect((col + margin) * moduleSize, (row + margin) * moduleSize, moduleSize, moduleSize);
    }
  }
  return canvas.toDataURL("image/png");
}

export function downloadTextFile(filename, contents, type = "text/plain") {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadDataUrl(filename, dataUrl) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
