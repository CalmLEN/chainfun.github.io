// CSV読み込み・パース処理
async function loadDataFromCsv(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error();
        const text = await response.text();
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
        
        return lines.slice(1).map(line => {
            // より高速なCSVパース（シンプルな正規表現利用）
            const values = [];
            let current = '';
            let inQuote = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    if (inQuote && line[i + 1] === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuote = !inQuote;
                    }
                } else if (char === ',' && !inQuote) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());
            
            // オブジェクト構築時の最適化
            const obj = {};
            for (let i = 0; i < headers.length; i++) {
                obj[headers[i]] = values[i] !== undefined ? values[i] : null;
            }
            
            // 変換処理
            const charalist = obj.charalist || '';
            obj.characters = charalist ? charalist.split(/[,、]/).map(char => char.trim()).filter(Boolean) : [];
            obj.note = (obj.biko || '').replace(/_NL_/g, '\n');
            
            // CHARACTER_QUEST系はファイル名も含めて一意化
            if (obj.catCode === 'CHARACTER_QUEST' && filePath) {
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
        console.error(`Failed to load file: ${filePath}`, error);
        return [];
    }
}

async function loadAllScenarioData() {
    let allScenarios = [];
    
    // 読み込み対象のファイル一覧を準備
    const filesToLoad = [];
    
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
            characterQuestFiles.forEach(fileName => {
                filesToLoad.push(`data/${fileName}`);
            });
        } else {
            filesToLoad.push(`data/${cat.code}.csv`);
        }
    }
    
    // すべてのCSVを並列で読み込み
    const results = await Promise.allSettled(filesToLoad.map(filePath => loadDataFromCsv(filePath)));
    
    // 結果を集約
    results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
            allScenarios = allScenarios.concat(result.value);
        }
    });
    
    return allScenarios;
}
