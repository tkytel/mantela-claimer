'use strict';

/**
 * Mantela を芋蔓式に取得する
 * @param { string | URL | Request } firstMantela - 起点となる Mantela
 * @param { number } [maxNest = Infinity] - Mantela を辿る最大深さ
 */
async function
fetchMantelas(firstMantela, maxNest = Infinity)
{
    /** @type { Map<string, Mantela> } */
    const mantelas = new Map();

    /** @type { Set<string | URL | Request> } */
    const queue = new Set([ firstMantela ]);

    /** @type { Set<string | URL | Request> } */
    const visited = new Set();

    /* 負の深さは許されない */
    if (maxNest < 0)
        throw new RangeError('maxNest must not be negative.');

    for (let nest = 0; queue.size > 0 && nest <= maxNest; nest++) {
        /* いまあるリソースを同時に取得する */
        const current = [ ...queue.values() ];
        const results = await Promise.allSettled(
            current.map(
                e => fetch(e, { mode: 'cors' })
                        .then(res => res.json())
                        .catch(err => new Error(err))
            )
        );
        queue.clear();

        /* Mantela を登録する */
        results.forEach((e, i) => {
            /* 失敗していたらとりあえず何もしない */
            if (e.status === 'rejected')
                return;

            /* 自分の識別子を持っていないような Mantela は相手にしない */
            if (!e.value?.aboutMe?.identifier)
                return;

            /* Mantela を登録し、訪問済みに追加 */
            mantelas.set(e.value.aboutMe.identifier, e.value);
            visited.add(current[i]);
            visited.add(e.value.aboutMe.identifier);
        });

        /* 次に取得する Mantela を収集する */
        results.forEach((e, i) => {
            /* 接続済の交換局についての情報を持っていないなら何もしない */
            if (!e.value?.providers)
                return;

            e.value.providers.forEach(e => {
                if (e?.mantela && !visited.has(e.mantela)
                        && e?.identifier && !visited.has(e.identifier))
                    queue.add(e.mantela);
            });
        });
    }

    return mantelas;
}
/* ex: se et ts=4 : */