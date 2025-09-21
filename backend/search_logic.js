// 検索・表示ロジック
function filterScenarios(scenarios, options) {
    const {
        characterNames,
        notCharacterNames,
        noteSearchString,
        questNameSearchString,
        questSearchMode,
        lastSearchMode,
        lastNotSearchMode,
        lastSelectedCategoryCodes
    } = options;

    return scenarios.filter(scenario => {
        let isCharacterMatch = true;
        if (characterNames.length > 0) {
            if (lastSearchMode === 'OR') {
                isCharacterMatch = scenario.characters && scenario.characters.some(char => characterNames.some(query => char.includes(query)));
            } else {
                isCharacterMatch = scenario.characters && characterNames.every(query => scenario.characters.some(char => char.includes(query)));
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

        const isCategoryMatch = lastSelectedCategoryCodes.length === 0 || lastSelectedCategoryCodes.includes(scenario.catCode);

        let isQuestNameMatch = true;
        if (questNameSearchString.length > 0) {
            const questKeywords = questNameSearchString.split(/[,、\s]+/).filter(q => q.length > 0);
            const questFields = [scenario.lv1, scenario.lv2, scenario.lv3, scenario.name].filter(Boolean);
            if (questSearchMode === 'OR') {
                isQuestNameMatch = questFields.some(field => questKeywords.some(q => field.includes(q)));
            } else {
                isQuestNameMatch = questKeywords.every(q => questFields.some(field => field.includes(q)));
            }
        }

        return isCharacterMatch && isNotCharacterMatch && isNoteMatch && isCategoryMatch && isQuestNameMatch;
    });
}
