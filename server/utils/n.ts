import * as fs from 'fs';
import * as path from 'path';
import * as lz4 from 'lz4';

type Mapping = { Key: string; Value: string };

interface MappingObject {
  libMBIN_version: string;
  Mapping: Mapping[];
}

function uint32(data: Buffer): number {
  return data.readUInt32LE(0);
}

function byte4(data: number): Buffer {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(data, 0);
  return buf;
}

function decompress(data: Buffer): Buffer {
  const size = data.length;
  let offset = 0;
  const outChunks: Buffer[] = [];
  
  while (offset < size) {
    if (size - offset < 4) {
      throw new Error("Invalid block: insufficient data for magic number");
    }
    
    const magic = uint32(data.slice(offset, offset + 4));
    offset += 4;
    
    if (magic !== 0xfeeda1e5) {
      throw new Error("Invalid block, bad file: wrong magic number");
    }
    
    if (size - offset < 4) {
      throw new Error("Invalid block: insufficient data for compressed size");
    }
    const compressedSize = uint32(data.slice(offset, offset + 4));
    offset += 4;
    
    if (size - offset < 4) {
      throw new Error("Invalid block: insufficient data for uncompressed size");
    }
    const uncompressedSize = uint32(data.slice(offset, offset + 4));
    offset += 4;
    
    offset += 4;
    
    if (size - offset < compressedSize) {
      throw new Error("Invalid block: insufficient data for compressed block");
    }
    
    const compressedBlock = data.slice(offset, offset + compressedSize);
    offset += compressedSize;
    
    const decompressed = Buffer.alloc(uncompressedSize);
    const bytesDecoded = lz4.decodeBlock(compressedBlock, decompressed);
    
    if (bytesDecoded !== uncompressedSize) {
      throw new Error(`Decompression size mismatch: expected ${uncompressedSize}, got ${bytesDecoded}`);
    }
    
    outChunks.push(decompressed);
  }
  
  return Buffer.concat(outChunks);
}

function compress(data: Buffer): Buffer {
  const size = data.length;
  let offset = 0;
  const outChunks: Buffer[] = [];
  
  const blockSize = 0x80000;
  
  while (offset < size) {
    const uncompressedSize = Math.min(blockSize, size - offset);
    const uncompressedBlock = data.slice(offset, offset + uncompressedSize);
    offset += uncompressedSize;
    
    const compressed = Buffer.alloc(lz4.encodeBound(uncompressedSize));
    const compressedSize = lz4.encodeBlock(uncompressedBlock, compressed);
    const compressedBlock = compressed.slice(0, compressedSize);
    
    outChunks.push(byte4(0xfeeda1e5));
    outChunks.push(byte4(compressedSize));
    outChunks.push(byte4(uncompressedSize));
    outChunks.push(byte4(0));
    outChunks.push(compressedBlock);
  }
  
  return Buffer.concat(outChunks);
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

async function fetchMapping(): Promise<Mapping[]> {
  const mappingUrl = 'https://github.com/monkeyman192/MBINCompiler/releases/latest/download/mapping.json';
  console.log('Downloading mapping...');
  
  const fetchedFile = await fetch(mappingUrl);
  const fetchedJson: MappingObject = await fetchedFile.json();
  console.log("Mapping downloaded successfully!");

  return fetchedJson.Mapping;
}

async function applyMapping(data: string, mappingFileName?: string): Promise<string> {
  let mapping: Mapping[];
  
  if (mappingFileName && fs.existsSync(mappingFileName)) {
    const mappingFileData = fs.readFileSync(mappingFileName, 'utf-8');
    const mappingObj: MappingObject = JSON.parse(mappingFileData);
    mapping = mappingObj.Mapping;
  } else {
    mapping = await fetchMapping();
  }
  
  let fileJson: any;
  console.log('Parsing JSON data...');
  try {
    fileJson = JSON.parse(data);
  } catch {
    fileJson = JSON.parse(data.slice(0, -1));
  }
  
  const isMapped = Boolean(fileJson.Version);
  const mappingFunction = isMapped ? reverseMapKeys : mapKeys;
  
  console.log('Mapping keys...');
  const mappedSave = mappingFunction(fileJson, mapping);
  
  return JSON.stringify(mappedSave, null, isMapped ? undefined : 2);
}

export async function encodeSave(data: string): Promise<Buffer> {
  console.log('Encoding save data...');
  
  // Применяем маппинг
  console.log('Applying mapping...');
  const mappedData = await applyMapping(data);
  
  // Сжимаем
  console.log('Compressing...');
  const jsonBuffer = Buffer.from(mappedData, 'utf-8');
  const compressed = compress(jsonBuffer);
  
  console.log('Encoding complete!');
  return compressed;
}

export async function decodeSave(fileBuffer: Buffer): Promise<string> {
  console.log('Decoding save file...');
  
  // Распаковываем
  console.log('Decompressing...');
  const decompressed = decompress(fileBuffer);
  
  // Преобразуем в строку JSON
  const jsonData = decompressed.toString('utf-8');
  
  // Применяем обратный маппинг
  console.log('Applying reverse mapping...');
  const finalJson = await applyMapping(jsonData);
  
  console.log('Decoding complete!');
  return finalJson;
}

// Вспомогательная функция для проверки является ли файл .hg
export function isHgFile(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  const magic = uint32(buffer.slice(0, 4));
  return magic === 0xfeeda1e5;
}

// Вспомогательная функция для проверки является ли строка JSON
export function isJsonString(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}