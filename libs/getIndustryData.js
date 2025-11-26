function getIndustryData(lang) {
    if (lang === 'hi') return require('./industries/industryJson-hi.json')
    if (lang === 'en') return require('./industries/industryJson-en.json')
    if (lang === 'fr') return require('./industries/industryJson-fr.json')
    if (lang === 'es') return require('./industries/industryJson-es.json')
    if (lang === 'ar') return require('./industries/industryJson-ar.json')
    if (lang === 'ko') return require('./industries/industryJson-ko.json')
    if (lang === 'pt') return require('./industries/industryJson-pt.json')
    return require('./industries/industryJson-en.json')
}
export default getIndustryData