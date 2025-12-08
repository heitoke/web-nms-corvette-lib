import { createError } from 'h3';
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server';

interface Image {
    id: string;
    url: string;
}

/*
app.post('/save/hg2', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Нет файла для загрузки.');
        }

        const chunkIndex = parseInt(req.body.chunkIndex);
        const totalChunks = parseInt(req.body.totalChunks);
        const userId = req.body.userId; // Получаем идентификатор пользователя

        if (!userUploads[userId]) {
            userUploads[userId] = []; // Инициализируем массив для пользователя
        }

        // Сборка частей в массив
        userUploads[userId][chunkIndex] = req.file.buffer;

        // Если все части загружены
        if (chunkIndex === totalChunks - 1) {
            const buffer = Buffer.concat(userUploads[userId])
            const json = JSON.parse(buffer.toString('utf-8'));

            // const mapping = await nmsSave.fetchMapping();
            // const json = await nmsSave.reverseMapKeys(body, mapping);
            const bufferJson = Buffer.from(JSON.stringify(json), 'utf-8');
            const saveBuffer = await nmsSave.compress(bufferJson);

            console.log(Buffer.isBuffer(saveBuffer), Buffer.isBuffer(saveBuffer.buffer))

            if (!Buffer.isBuffer(saveBuffer)) {
                return res.status(500).send('Ошибка при генерации буфера.');
            }

            res.set({
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="save.hg"`
            });

            res.send(saveBuffer);
            delete userUploads[userId]; // Удаляем данные пользователя после отправки
        } else {
            res.send(`Часть ${chunkIndex + 1} из ${totalChunks} успешно загружена.`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Произошла ошибка.');
    }
});
*/ 

const stateUploads: Record<string, any> = {};
const allowPartKeys = ['chunkIndex', 'chunkTotal', 'imageIndex', 'totalImages', 'state'];


export default defineEventHandler(async (event) => {
    const parts = await readMultipartFormData(event);
    const { state, chunkIndex, totalChunks, imageIndex, totalImages } = await getQuery(event) as any;
    
    if (!parts || !state || !chunkIndex || !totalChunks || !imageIndex || !totalImages) return { success: false, message: 'No data received' };

    const $user = await serverSupabaseUser(event);
    const client = await serverSupabaseClient<any>(event);

    const corvetteId = getRouterParam(event, 'id');

    const apiKeyImgDB = useRuntimeConfig()?.apiKeyImgDB;

    const { data: corvette, error } = await client.from('corvettes').select('id, data').eq('id', Number(corvetteId!)).eq('user_id', $user?.app_metadata?.public_id);

    if (error) {
        throw createError({ statusMessage: error.message });
    }

    for (const part of parts) {
        if (part?.name === 'chunk' && part?.filename && part?.data && part?.type && ['image/png', 'image/jpeg', 'application/octet-stream'].includes(part.type)) {
            // const formData = new FormData();

            // const blob = new Blob([part.data as any], { type: part.type });
            
            // formData.append('image', blob, part.filename);

            // const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKeyImgDB}&name=${corvetteId}-${n}`, {
            //     body: formData,
            //     method: 'POST'
            // });

            // if (!res?.ok) continue;

            // const json = await res.json();

            // console.log(json)

            // images.push({
            //     id: json?.data?.id,
            //     url: json?.data?.url
            // });

            console.log(part?.filename, state, imageIndex, totalImages, chunkIndex, totalChunks, (imageIndex === totalImages - 1) && (chunkIndex === totalChunks - 1));

            if (!stateUploads[state]) stateUploads[state] = {};
            if (!stateUploads[state][imageIndex]) stateUploads[state][imageIndex] = [];

            stateUploads[state][imageIndex][chunkIndex] = part.data;

            console.log('ready', Number(imageIndex) === Number(totalImages - 1) && Number(chunkIndex) === Number(totalChunks - 1))

            if (Number(imageIndex) === Number(totalImages - 1) && Number(chunkIndex) === Number(totalChunks - 1)) {
                const images: Array<Image> = [];

                console.log('start', stateUploads[state])

                for (const image in stateUploads[state]) {
                    const buffer = Buffer.concat(stateUploads[state][image]);
                    const blob = new Blob([buffer], { type: part.type });

                    console.log('image', image)

                    const formData = new FormData();
                    formData.append('image', blob, '[PROXY]');

                    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKeyImgDB}&name=${corvetteId}-${image}`, {
                        body: formData,
                        method: 'POST'
                    });

                    if (!res?.ok) continue;

                    const json = await res.json();

                    console.log(json)

                    images.push({
                        id: json?.data?.id,
                        url: json?.data?.url
                    });
                }

                const { data, error: err } = await client.from('corvettes')
                    .update({
                        images
                    })
                    .eq('id', corvetteId!)
                    .select('id, name, images, description, created_at')
                    .single();
                    
                if (err) {
                    throw createError({ statusMessage: err.message });
                }
            
                return data;
            } else {
                return { chunk: true }
            }
        }
    }

    return { chunk: true }
});