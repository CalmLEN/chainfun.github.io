// CSV読み込み・パース処理
async function loadDataFromCsv(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error();
        const text = await response.text();
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
        return lines.slice(1).map(line => {
            const obj = {};
            const values = [];
            let inQuote = false;
            let currentField = '';
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    if (inQuote && i + 1 < line.length && line[i+1] === '"') {
                        currentField += '"';
                        i++;
                    } else {
                        inQuote = !inQuote;
                    }
                } else if (char === ',' && !inQuote) {
                    values.push(currentField.trim());
                    currentField = '';
                } else {
                    currentField += char;
                }
            }
            values.push(currentField.trim());
            headers.forEach((header, index) => {
                obj[header] = values[index] !== undefined ? values[index] : null;
            });
            obj.characters = (obj.charalist || '').split(/[,、]/).map(char => char.trim()).filter(char => char);
            obj.note = (obj.biko || '').replace(/_NL_/g, '\n');
            // CHARACTER_QUEST系はファイル名も含めて一意化
            if (obj.catCode === 'CHARACTER_QUEST' && filePath) {
                // filePath例: data/CHARACTER_QUEST_01.csv → "CHARACTER_QUEST_01"
                const fileBase = filePath.replace(/^.*\/(CHARACTER_QUEST_[^./]+)\.csv$/i, '$1');
                obj.uniqueId = `${obj.catCode}-${fileBase}-${obj.id}`;
            } else {
                obj.uniqueId = obj.catCode && obj.id ? `${obj.catCode}-${obj.id}` : '';
            }
            delete obj.charalist;
            delete obj.biko;
            return obj;
        });
    } catch (error) {
        return [];
    }
}

async function loadAllScenarioData() {
    let allScenarios = [];
    for (const cat of majorCategories) {
        if (cat.code === 'CHARACTER_QUEST') {
            const characterQuestFiles = [
                'CHARACTER_QUEST_01_GIYUGUN.csv',
                'CHARACTER_QUEST_02_FUKUTO.csv',
                'CHARACTER_QUEST_03_SEITO.csv',
                'CHARACTER_QUEST_04_KENJA.csv',
                'CHARACTER_QUEST_05_MEIKYU.csv',
                'CHARACTER_QUEST_06_KOTO.csv',
                'CHARACTER_QUEST_07_SEIREIJIMA.csv',
                'CHARACTER_QUEST_08_KYURYO.csv',
                'CHARACTER_QUEST_09_TAIKAI.csv',
                'CHARACTER_QUEST_10_KEMONO.csv',
                'CHARACTER_QUEST_11_TSUMI.csv',
                'CHARACTER_QUEST_12_HAKUMEI.csv',
                'CHARACTER_QUEST_13_TETSUEN.csv',
                'CHARACTER_QUEST_14_NENDAIKI.csv',
                'CHARACTER_QUEST_15_REMRES.csv',
                'CHARACTER_QUEST_16_MAJIN.csv',
                'CHARACTER_QUEST_17_TABIBITO.csv',
                'CHARACTER_QUEST_18_GENREI.csv',
                'CHARACTER_QUEST_19_GENJU.csv',
                'CHARACTER_QUEST_20_BORYAKU.csv',
                'CHARACTER_QUEST_21_YUGI.csv',
                'CHARACTER_QUEST_22_SHINSEN.csv',
                'CHARACTER_QUEST_23_SENKAN.csv',
                'CHARACTER_QUEST_24_IF.csv',
                'CHARACTER_QUEST_25_KAKURIYO.csv',
                'CHARACTER_QUEST_26_NARAKU.csv',
                'CHARACTER_QUEST_27_MUKURO.csv'
            ];
            for (const fileName of characterQuestFiles) {
                try {
                    const data = await loadDataFromCsv(`data/${fileName}`);
                    allScenarios = allScenarios.concat(data);
                } catch (error) {}
            }
        } else {
            const fileName = `${cat.code}.csv`;
            try {
                const data = await loadDataFromCsv(`data/${fileName}`);
                allScenarios = allScenarios.concat(data);
            } catch (error) {}
        }
    }
    return allScenarios;
}
