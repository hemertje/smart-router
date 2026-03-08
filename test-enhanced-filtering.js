const keywords = ['AI', 'machine learning', 'routing', 'smart', 'performance', 'optimization', 'algorithm', 'infrastructure', 'throughput'];
const trends = ['multimodal', 'democratization', 'automation', 'efficiency', 'optimization', 'performance improvement', 'processing time', 'infrastructure upgrade'];
const impact = ['breakthrough', 'launch', 'acquisition', 'improvement', 'boosts', 'significantly', 'reduces', 'enhances'];

const text = 'System Optimization Results in 40% Performance Improvement';

const keywordMatches = keywords.filter(k => text.toLowerCase().includes(k.toLowerCase())).length;
const trendMatches = trends.filter(t => text.toLowerCase().includes(t.toLowerCase())).length;
const impactMatches = impact.filter(i => text.toLowerCase().includes(i.toLowerCase())).length;

console.log('🔍 Enhanced Analysis:');
console.log('📊 Keyword matches:', keywordMatches);
console.log('📈 Trend matches:', trendMatches);
console.log('💥 Impact matches:', impactMatches);
console.log('🎯 Total matches:', keywordMatches + trendMatches + impactMatches);

// Basic vs Enhanced comparison
const basicKeywords = ['AI', 'machine learning', 'routing', 'smart'];
const basicTrends = ['multimodal', 'democratization', 'automation'];
const basicImpact = ['breakthrough', 'launch', 'acquisition'];

const basicKeywordMatches = basicKeywords.filter(k => text.toLowerCase().includes(k.toLowerCase())).length;
const basicTrendMatches = basicTrends.filter(t => text.toLowerCase().includes(t.toLowerCase())).length;
const basicImpactMatches = basicImpact.filter(i => text.toLowerCase().includes(i.toLowerCase())).length;

console.log('\n📈 Basic vs Enhanced Comparison:');
console.log('🔸 Basic matches:', basicKeywordMatches + basicTrendMatches + basicImpactMatches);
console.log('🔸 Enhanced matches:', keywordMatches + trendMatches + impactMatches);
console.log('🚀 Improvement:', ((keywordMatches + trendMatches + impactMatches) / (basicKeywordMatches + basicTrendMatches + basicImpactMatches) * 100).toFixed(0) + '%');
