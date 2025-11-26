function getLevelData(lang) {
    if (lang === 'hi') return require('./levels/levels-hi.json')
    if (lang === 'en') return require('./levels/levels-en.json')
    if (lang === 'fr') return require('./levels/levels-fr.json')
    if (lang === 'es') return require('./levels/levels-es.json')
    if (lang === 'ar') return require('./levels/levels-ar.json')
    if (lang === 'ko') return require('./levels/levels-ko.json')
    if (lang === 'pt') return require('./levels/levels-pt.json')
    return require('./levels/levels-en.json')
}
export default getLevelData