// 検索・表示ロジック
function filterScenarios(scenarios, options) {
    const {
        characterNames,
        notCharacterNames,
        noteSearchString,
        questSearchString,
        questNameSearchString,
        notQuestNameSearchString,
        questSearchMode,
        notQuestSearchMode,
        includeBattleAffiliation = false,
        exactCharacterMatch = false,
        lastSearchMode,
        lastNotSearchMode,
        lastSelectedCategoryCodes,
        lastSelectedBuCodes
    } = options;

    return scenarios.filter(scenario => {
        let isCharacterMatch = true;
        if (characterNames.length > 0) {
            // exactCharacterMatch: キャラ名一覧からの検索用（完全一致）。通常は部分一致
            const matchName = (char, query) => exactCharacterMatch ? char === query : char.includes(query);
            if (lastSearchMode === 'OR') {
                isCharacterMatch = scenario.characters && scenario.characters.some(char => characterNames.some(query => matchName(char, query)));
            } else {
                isCharacterMatch = scenario.characters && characterNames.every(query => scenario.characters.some(char => matchName(char, query)));
            }
        }

        let isNotCharacterMatch = true;
        if (notCharacterNames.length > 0) {
            if (lastNotSearchMode === 'NOT_OR') {
                isNotCharacterMatch = scenario.characters && notCharacterNames.every(query => scenario.characters.every(char => !char.includes(query)));
            } else {
                isNotCharacterMatch = scenario.characters && notCharacterNames.some(query => scenario.characters.every(char => !char.includes(query)));
            }
        }

        let isNoteMatch = true;
        if (noteSearchString.length > 0) {
            isNoteMatch = scenario.note && scenario.note.includes(noteSearchString);
        }

        let isQuestMatch = true;
        if (questSearchString.length > 0) {
            isQuestMatch = scenario.quest && scenario.quest.includes(questSearchString);
        }

        const isCategoryMatch = lastSelectedCategoryCodes.length === 0 || lastSelectedCategoryCodes.includes(scenario.catCode);

        const isBuMatch = lastSelectedBuCodes.length === 0 || lastSelectedBuCodes.includes(scenario.bu);

        let isQuestNameMatch = true;
        if (questNameSearchString.length > 0) {
            const questKeywords = questNameSearchString.split(/[,、\s]+/).filter(q => q.length > 0);
            const questFields = [scenario.lv1, scenario.lv2, scenario.lv3, scenario.name].filter(Boolean);
            if (includeBattleAffiliation && scenario.char_battle) {
                questFields.push(String(scenario.char_battle).trim());
            }
            if (questSearchMode === 'OR') {
                isQuestNameMatch = questFields.some(field => questKeywords.some(q => field.includes(q)));
            } else {
                isQuestNameMatch = questKeywords.every(q => questFields.some(field => field.includes(q)));
            }
        }

        let isNotQuestNameMatch = true;
        if (notQuestNameSearchString.length > 0) {
            const notQuestKeywords = notQuestNameSearchString.split(/[,、\s]+/).filter(q => q.length > 0);
            const questFields = [scenario.lv1, scenario.lv2, scenario.lv3, scenario.name].filter(Boolean);
            if (includeBattleAffiliation && scenario.char_battle) {
                questFields.push(String(scenario.char_battle).trim());
            }
            if (notQuestSearchMode === 'NOT_OR') {
                isNotQuestNameMatch = notQuestKeywords.every(q => questFields.every(field => !field.includes(q)));
            } else {
                isNotQuestNameMatch = notQuestKeywords.some(q => questFields.every(field => !field.includes(q)));
            }
        }

        return isCharacterMatch && isNotCharacterMatch && isNoteMatch && isQuestMatch && isCategoryMatch && isBuMatch && isQuestNameMatch && isNotQuestNameMatch;
    });
}

// キャラ名ごとの登場シナリオ数を集計（1シナリオにつき1回カウント）
// 戻り値: [{ name, count }] を登場数の降順（同数は名前順）で返す
function countCharacterAppearances(scenarios) {
    const counts = new Map();
    scenarios.forEach(scenario => {
        if (!scenario.characters) return;
        new Set(scenario.characters).forEach(name => {
            counts.set(name, (counts.get(name) || 0) + 1);
        });
    });
    return Array.from(counts, ([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ja'));
}
