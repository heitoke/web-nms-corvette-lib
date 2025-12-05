import M from '~/assets/mapping.json'
import * as lz4js from 'lz4js';

// console.log(Buffer.alloc)

type Mapping = { Key: string; Value: string };

interface MappingObject {
  libMBIN_version: string;
  Mapping: Mapping[];
}

// ==================== Утилиты для работы с байтами ====================

function uint32(data: Uint8Array, offset: number): number {
  return (data[offset]) |
         (data[offset + 1] << 8) |
         (data[offset + 2] << 16) |
         (data[offset + 3] << 24);
}

function byte4(data: number): Uint8Array {
  const arr = new Uint8Array(4);
  arr[0] = data & 0xff;
  arr[1] = (data >> 8) & 0xff;
  arr[2] = (data >> 16) & 0xff;
  arr[3] = (data >> 24) & 0xff;
  return arr;
}

// ==================== LZ4 для веб-окружения ====================

// Простая реализация LZ4 decode для веба
function lz4DecodeBlock(src: Uint8Array, dst: Uint8Array): number {
  // Упрощенная реализация - в реальном проекте лучше использовать готовую библиотеку
  // или WebAssembly версию lz4
  let si = 0;
  let di = 0;
  
  while (si < src.length && di < dst.length) {
    const token = src[si++];
    let literalLength = token >> 4;
    
    if (literalLength === 0xf) {
      let byte;
      do {
        byte = src[si++];
        literalLength += byte;
      } while (byte === 0xff);
    }
    
    // Копируем литералы
    for (let i = 0; i < literalLength; i++) {
      dst[di++] = src[si++];
    }
    
    if (si >= src.length) break;
    
    const offset = (src[si++]) | (src[si++] << 8);
    let matchLength = token & 0xf;
    
    if (matchLength === 0xf) {
      let byte;
      do {
        byte = src[si++];
        matchLength += byte;
      } while (byte === 0xff);
    }
    matchLength += 4;
    
    // Копируем совпадения
    const start = di - offset;
    for (let i = 0; i < matchLength; i++) {
      dst[di++] = dst[start + i];
    }
  }
  
  return di;
}

function lz4EncodeBound(size: number): number {
  return size + Math.floor(size / 255) + 16;
}

// ==================== Сжатие/распаковка NMS для веба ====================

export function decompress(data: Uint8Array): Uint8Array {
  const size = data.length;
  let offset = 0;
  const outChunks: Uint8Array[] = [];
  
  while (offset < size) {
    if (size - offset < 4) {
      throw new Error("Invalid block: insufficient data for magic number");
    }
    
    const magic = uint32(data, offset);
    offset += 4;
    
    // if (magic !== 0xfeeda1e5) {
    //   throw new Error("Invalid block, bad file: wrong magic number");
    // }
    
    if (size - offset < 4) {
      throw new Error("Invalid block: insufficient data for compressed size");
    }
    const compressedSize = uint32(data, offset);
    offset += 4;
    
    if (size - offset < 4) {
      throw new Error("Invalid block: insufficient data for uncompressed size");
    }
    const uncompressedSize = uint32(data, offset);
    offset += 4;
    
    // Skip 4 bytes
    offset += 4;
    
    if (size - offset < compressedSize) {
      throw new Error("Invalid block: insufficient data for compressed block");
    }
    
    const compressedBlock = data.slice(offset, offset + compressedSize);
    offset += compressedSize;
    
    const decompressed = new Uint8Array(uncompressedSize);
    const bytesDecoded = lz4DecodeBlock(compressedBlock, decompressed);
    
    if (bytesDecoded !== uncompressedSize) {
      throw new Error(`Decompression size mismatch: expected ${uncompressedSize}, got ${bytesDecoded}`);
    }
    
    outChunks.push(decompressed);
  }
  
  // Объединяем все части
  const totalSize = outChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalSize);
  let pos = 0;
  for (const chunk of outChunks) {
    result.set(chunk, pos);
    pos += chunk.length;
  }
  
  return result;
}

// export function compress(data: Uint8Array): Uint8Array {
//   const size = data.length;
//   let offset = 0;
//   const outChunks: Uint8Array[] = [];
  
//   const blockSize = 0x80000;
  
//   while (offset < size) {
//     const uncompressedSize = Math.min(blockSize, size - offset);
//     const uncompressedBlock = data.slice(offset, offset + uncompressedSize);
//     offset += uncompressedSize;
    
//     // Упрощенная компрессия - в реальности нужна полная реализация LZ4
//     // Для примера просто оставляем данные несжатыми
//     const compressedSize = uncompressedSize;
//     const compressedBlock = uncompressedBlock;
    
//     const header = new Uint8Array(16);
//     header.set(byte4(0xfeeda1e5), 0);
//     header.set(byte4(compressedSize), 4);
//     header.set(byte4(uncompressedSize), 8);
//     header.set(byte4(0), 12);
    
//     outChunks.push(header);
//     outChunks.push(compressedBlock);
//   }
  
//   const totalSize = outChunks.reduce((sum, chunk) => sum + chunk.length, 0);
//   const result = new Uint8Array(totalSize);
//   let pos = 0;
//   for (const chunk of outChunks) {
//     result.set(chunk, pos);
//     pos += chunk.length;
//   }
  
//   return result;
// }

// ==================== Маппинг ключей ====================

let hashSize = 1 << 16;
async function compress(data: Uint8Array): Promise<Uint8Array> {
  const size = data.length;
  let offset = 0;
  const outChunks: Uint8Array[] = [];
  
  const blockSize = 0x80000;
//   const hashTable = new Int32Array(65536);
  while (offset < size) {
    const uncompressedSize = Math.min(blockSize, size - offset);
    const uncompressedBlock = data.slice(offset, offset + uncompressedSize);
    offset += uncompressedSize;

    const compressed = new ArrayBuffer(lz4js.compressBound(uncompressedSize));
    var hashTable = new Array(hashSize)
	for (var i = 0; i < hashSize; i++) {
		hashTable[i] = 0
	}
    let t =  new Uint8Array(compressed);
    const compressedSize = lz4js.compressBlock(uncompressedBlock, t, 0, t.length, hashTable);
    const compressedBlock = t.slice(0, compressedSize);

    outChunks.push(byte4(0xfeeda1e5));
    outChunks.push(byte4(compressedSize));
    outChunks.push(byte4(uncompressedSize));
    outChunks.push(byte4(0));
    outChunks.push(compressedBlock);
    
    // let compressedBlock: Uint8Array;
    // let compressedSize: number;
    
    
      // Браузерная версия
    //   const maxSize = lz4js.compressBound(uncompressedSize);
    //   const compressed = new Uint8Array(maxSize);
    //   compressedSize = lz4js.compressBlock(uncompressedBlock, compressed, 0, size, hashTable);
    //   compressedBlock = compressed.slice(0, compressedSize);
    
    // } else if (typeof require !== 'undefined') {
    //   // Node.js версия
    //   const lz4 = require('lz4');
    //   const compressedBuffer = Buffer.alloc(lz4.encodeBound(uncompressedSize));
    //   const compressedSizeResult = lz4.encodeBlock(uncompressedBlock, compressedBuffer);
    //   compressedSize = compressedSizeResult;
    //   compressedBlock = new Uint8Array(compressedBuffer.slice(0, compressedSize));
    // } else {
    //   throw new Error("LZ4 library not available");
    // }
    
    // const header = new Uint8Array(16);
    // header.set(byte4(0xfeeda1e5), 0);
    // header.set(byte4(compressedSize), 4);
    // header.set(byte4(uncompressedSize), 8);
    // header.set(byte4(0), 12);
    
    // outChunks.push(header);
    // outChunks.push(compressedBlock);
  }
  
//   const totalSize = outChunks.reduce((sum, chunk) => sum + chunk.length, 0);
//   const result = new Uint8Array(totalSize);
//   let pos = 0;
//   for (const chunk of outChunks) {
//     result.set(chunk, pos);
//     pos += chunk.length;
//   }
  const totalLength = outChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const combinedArray = new Uint8Array(totalLength);

  let currentOffset = 0;
  for (const chunk of outChunks) {
    combinedArray.set(chunk, currentOffset);
    currentOffset += chunk.length;
  }

  return combinedArray;
}

function mapKeys(json: any, mapping: Mapping[]): any {
  if (Array.isArray(json)) {
    return json.map((item) => mapKeys(item, mapping));
  } else if (typeof json === 'object' && json !== null) {
    const newJson: any = {};
    for (const key in json) {
      const mappedKey = mapping.find((m) => m.Key === key)?.Value;
      if (mappedKey) {
        newJson[mappedKey] = mapKeys(json[key], mapping);
      } else {
        newJson[key] = mapKeys(json[key], mapping);
      }
    }
    return newJson;
  } else {
    return json;
  }
}

function reverseMapKeys(json: any, mapping: Mapping[]): any {
  if (Array.isArray(json)) {
    return json.map((item) => reverseMapKeys(item, mapping));
  } else if (typeof json === 'object' && json !== null) {
    const newJson: any = {};
    for (const key in json) {
      const originalKey = mapping.find((m) => m.Value === key)?.Key;
      if (originalKey) {
        newJson[originalKey] = reverseMapKeys(json[key], mapping);
      } else {
        newJson[key] = reverseMapKeys(json[key], mapping);
      }
    }
    return newJson;
  } else {
    return json;
  }
}

// ==================== Работа с файлами в вебе ====================

export async function fetchMapping(): Promise<Mapping[]> {
//   const mappingUrl = 'https://github.com/monkeyman192/MBINCompiler/releases/latest/download/mapping.json';
//   console.log('Downloading mapping...');
  
//   const response = await fetch(mappingUrl);
//   if (!response.ok) {
//     throw new Error(`Failed to fetch mapping: ${response.status}`);
//   }
  
//   const fetchedJson: MappingObject = await response.json();
//   console.log("Success!");
  
  return M.Mapping;
}

export async function applyMapping(jsonData: any, mapping?: Mapping[]): Promise<any> {
  let mappingData: Mapping[];
  
  if (mapping) {
    mappingData = mapping;
  } else {
    mappingData = await fetchMapping();
  }
  
  const isMapped = Boolean(jsonData.Version);
  const mappingFunction = isMapped ? reverseMapKeys : mapKeys;
  
  console.log('Mapping keys...');
  const mappedSave = mappingFunction(jsonData, mappingData);
  
  return mappedSave;
}

// ==================== Основные функции для веба ====================

export async function encode(jsonData: string | object): Promise<Uint8Array> {
  console.log('Encoding...');
  
  let jsonObj: any;
  if (typeof jsonData === 'string') {
    try {
      jsonObj = JSON.parse(jsonData);
    } catch {
      // Попробуем удалить последний символ, если это невалидный JSON
      jsonObj = JSON.parse(jsonData.slice(0, -1));
    }
  } else {
    jsonObj = jsonData;
  }
  
  // Применяем маппинг
  console.log('Applying mapping...');
  const mapped = await applyMapping(jsonObj);
  
  // Конвертируем в строку и затем в Uint8Array
  const jsonString = JSON.stringify(mapped);
  const encoder = new TextEncoder();
  const jsonBuffer = encoder.encode(jsonString);
  
  // Сжимаем
  console.log('Compressing...');
  const compressed = compress(jsonBuffer);
  
  console.log('Encoding complete!');
  return compressed;
}

export async function decode(hgData: Uint8Array): Promise<string> {
  console.log('Decoding...');
  
  // Распаковываем
  console.log('Decompressing...');
  const decompressed = decompress(hgData);
  
  // Конвертируем в строку JSON
  const decoder = new TextDecoder('utf-8');
  const jsonString = decoder.decode(decompressed);
  
  // Парсим JSON
  let jsonObj: any;
  try {
    jsonObj = JSON.parse(jsonString);
  } catch {
    jsonObj = JSON.parse(jsonString.slice(0, -1));
  }
  
  // Применяем обратный маппинг
  console.log('Applying reverse mapping...');
  const mapped = await applyMapping(jsonObj);
  
  // Возвращаем как форматированный JSON
  const result = JSON.stringify(mapped, null, 2);
  
  console.log('Decoding complete!');
  return result;
}

// ==================== Вспомогательные функции для работы с файлами в браузере ====================

export async function encodeFile(file: File): Promise<Uint8Array> {
  const text = await file.text();
  return encode(text);
}

export async function decodeFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hgData = new Uint8Array(arrayBuffer);
  return decode(hgData);
}

// Функции для скачивания файлов в браузере
export function downloadFile(data: Uint8Array, filename: string): void {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadJson(jsonString: string, filename: string): void {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default {

}