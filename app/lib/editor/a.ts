import type { Mapping, MappingItem } from '~~/types/editor/mapping';


// Вспомогательные функции (часть из них у вас уже есть)

// 1. Функция обратного маппинга ключей (зашифровка ключей)
function reverseMapKeys(json: object, mapping: Mapping): object {
    if (Array.isArray(json)) {
        return json.map((item) => reverseMapKeys(item, mapping));
    } else if (typeof json === 'object' && json !== null) {
        const newJson: Record<string, any> = {};
        for (const key in json) {
            // Находим соответствующий зашифрованный ключ
            const reversedKey = mapping.find((m: MappingItem) => m.Value === key)?.Key || key;
            newJson[reversedKey] = reverseMapKeys(json[key], mapping);
        }
        return newJson;
    } else {
        return json;
    }
}

// 2. LZ4 компрессор (обратная функция к вашему декомпрессору)
function compress(input: Uint8Array, output: Uint8Array): number {
    let i = 0, j = 0;
    const inputLength = input.length;
    
    while (i < inputLength) {
        // Находим максимальное совпадение
        let bestMatchLength = 0;
        let bestMatchOffset = 0;
        const maxSearch = Math.min(i, 0xFFFF);
        
        // Поиск совпадений (упрощенный алгоритм LZ4)
        for (let offset = 1; offset <= maxSearch; offset++) {
            let matchLength = 0;
            while (
                i + matchLength < inputLength &&
                matchLength < 0xFF + 15 &&
                input[i + matchLength] === input[i - offset + matchLength]
            ) {
                matchLength++;
            }
            
            if (matchLength > bestMatchLength) {
                bestMatchLength = matchLength;
                bestMatchOffset = offset;
                if (matchLength >= 0xFF + 15) break;
            }
        }
        
        if (bestMatchLength >= 4) {
            // Кодируем совпадение
            const token = 0x00; // Оба поля будут установлены позже
            
            // Литералы перед совпадением (если есть)
            const literalsLength = 0; // В упрощенной версии предполагаем 0
            
            // Записываем токен
            let tokenByte = (literalsLength << 4) | Math.min(bestMatchLength - 4, 0x0F);
            output[j++] = tokenByte;
            
            // Если длина литералов > 15
            if (literalsLength >= 15) {
                let length = literalsLength - 15;
                while (length >= 255) {
                    output[j++] = 255;
                    length -= 255;
                }
                output[j++] = length;
            }
            
            // Копируем литералы
            // (в упрощенной версии пропускаем, так как literalsLength = 0)
            
            // Записываем смещение (little-endian)
            output[j++] = bestMatchOffset & 0xFF;
            output[j++] = (bestMatchOffset >> 8) & 0xFF;
            
            // Если длина совпадения > 19 (4 + 15)
            if (bestMatchLength - 4 >= 15) {
                let matchLen = bestMatchLength - 19;
                while (matchLen >= 255) {
                    output[j++] = 255;
                    matchLen -= 255;
                }
                output[j++] = matchLen;
            }
            
            i += bestMatchLength;
        } else {
            // Литерал без совпадения
            const literalsLength = 1;
            const tokenByte = (literalsLength << 4) | 0;
            output[j++] = tokenByte;
            
            // Копируем литерал
            output[j++] = input[i++];
        }
    }
    
    return j; // Возвращаем размер сжатых данных
}

// 3. Главная функция упаковки
export async function compressSave(jsonData: object, mapping: Mapping, originalFile?: ArrayBuffer): Promise<ArrayBuffer> {
    // 1. Обратный маппинг ключей
    const obfuscatedJson = reverseMapKeys(jsonData, mapping);
    
    // 2. Преобразуем JSON в строку
    const jsonString = JSON.stringify(obfuscatedJson);
    console.log(`JSON размер: ${jsonString.length} символов`);
    
    // 3. Разбиваем на блоки по 64KB (максимальный размер блока в LZ4)
    const MAX_BLOCK_SIZE = 64 * 1024; // 64KB
    const blocks: string[] = [];
    
    for (let i = 0; i < jsonString.length; i += MAX_BLOCK_SIZE) {
        blocks.push(jsonString.substring(i, i + MAX_BLOCK_SIZE));
    }
    
    console.log(`Количество блоков: ${blocks.length}`);
    
    // 4. Сжимаем каждый блок и создаем заголовки
    const resultChunks: Uint8Array[] = [];
    
    for (let i = 0; i < blocks.length; i++) {
        const blockText = blocks[i];
        const uncompressedData = new TextEncoder().encode(blockText);
        
        // Создаем буфер для сжатых данных (в худшем случае размер + 4%)
        const maxCompressedSize = uncompressedData.length + (uncompressedData.length >>> 6) + 16;
        const compressedBuffer = new Uint8Array(maxCompressedSize);
        
        // Сжимаем блок
        const compressedSize = compress(uncompressedData, compressedBuffer);
        
        // Создаем заголовок блока (16 байт)
        const header = new ArrayBuffer(16);
        const headerView = new DataView(header);
        
        // Магическое число No Man's Sky
        headerView.setUint32(0, 0xfeeda1e5, true); // little-endian
        
        // Размер сжатых данных
        headerView.setUint32(4, compressedSize, true);
        
        // Размер несжатых данных
        headerView.setUint32(8, uncompressedData.length, true);
        
        // Резерв (обычно 0)
        headerView.setUint32(12, 0, true);
        
        // Добавляем заголовок и сжатые данные в результат
        resultChunks.push(new Uint8Array(header));
        resultChunks.push(compressedBuffer.slice(0, compressedSize));
        
        console.log(`Блок ${i + 1}: ${uncompressedData.length} -> ${compressedSize} байт`);
    }
    
    // 5. Объединяем все блоки в один ArrayBuffer
    const totalSize = resultChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const resultBuffer = new Uint8Array(totalSize);
    
    let offset = 0;
    for (const chunk of resultChunks) {
        resultBuffer.set(chunk, offset);
        offset += chunk.length;
    }
    
    console.log(`Итоговый размер: ${resultBuffer.length} байт`);
    
    return resultBuffer.buffer;
}

// 4. Функция для создания полного .hg файла с заголовком Hello Games
export async function createHGFile(
    jsonData: object, 
    mapping: Mapping, 
    originalHGFile?: ArrayBuffer
): Promise<ArrayBuffer> {
    // 1. Получаем сжатые данные (без заголовка .hg)
    const compressedData = await compressSave(jsonData, mapping, originalHGFile);
    
    // 2. Создаем заголовок .hg файла
    const hgHeader = new ArrayBuffer(16);
    const headerView = new DataView(hgHeader);
    
    // Магическое число Hello Games
    headerView.setUint32(0, 0x676E6F4D, true); // "Mong" = GNOM наоборот
    
    // Размер несжатых данных (общий для всех блоков)
    // Для расчета нужно знать общий размер всех блоков JSON
    const jsonString = JSON.stringify(reverseMapKeys(jsonData, mapping));
    const uncompressedSize = jsonString.length;
    headerView.setUint32(4, uncompressedSize, true);
    
    // Размер сжатых данных
    headerView.setUint32(8, compressedData.byteLength, true);
    
    // Контрольная сумма (CRC32)
    const compressedUint8 = new Uint8Array(compressedData);
    const checksum = calculateCRC32(compressedUint8);
    headerView.setUint32(12, checksum, true);
    
    console.log(`Заголовок .hg: размер=${uncompressedSize}->${compressedData.byteLength}, CRC32=0x${checksum.toString(16)}`);
    
    // 3. Объединяем заголовок и данные
    const finalBuffer = new Uint8Array(16 + compressedData.byteLength);
    finalBuffer.set(new Uint8Array(hgHeader), 0);
    finalBuffer.set(new Uint8Array(compressedData), 16);
    
    return finalBuffer.buffer;
}

// 5. Вспомогательная функция для расчета CRC32 (нужна для заголовка .hg)
function calculateCRC32(data: Uint8Array): number {
    let crc = 0 ^ (-1);
    
    for (const byte of data) {
        crc = (crc >>> 8) ^ crc32Table[(crc ^ byte) & 0xFF];
    }
    
    return (crc ^ (-1)) >>> 0; // Преобразуем в unsigned int
}

// Таблица CRC32
const crc32Table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crc32Table[i] = c;
}

// 6. Функция для сохранения файла (браузерная версия)
export function saveFile(data: ArrayBuffer, filename: string) {
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

async function readFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (result instanceof ArrayBuffer) {
                resolve(result);
            } else {
                reject(new Error('Something went wrong!'));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}

// 7. Пример использования (для браузера)
export async function processSaveFile(json: object, file: File, mapping: any) {
    // Предположим, у нас есть:
    // 1. Оригинальный save4.hg файл (для структуры)
    // 2. Отредактированный JSON
    // 3. Маппинг ключей
    
    // Загружаем оригинальный файл (если нужна структура)
    const originalFile = await readFile(file);
    
    // Получаем отредактированный JSON (из UI)
    
    // Маппинг (должен быть такой же, как при декомпрессии)
    
    try {
        // Создаем новый .hg файл
        const newHGFile = await createHGFile(json, mapping, originalFile);
        
        // Сохраняем файл
        saveFile(newHGFile, 'save4_edited.hg');
        
        console.log('Файл успешно создан!');
    } catch (error) {
        console.error('Ошибка при создании файла:', error);
    }
}