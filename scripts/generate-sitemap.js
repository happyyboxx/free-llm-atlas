#!/usr/bin/env node
/**
 * Generate sitemap.xml and feed.xml for Free LLM Atlas
 * Runs during GitHub Pages deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_URL = 'https://happyyboxx.github.io/free-llm-atlas';
const SITE_NAME = 'Free LLM Atlas';
const SITE_DESC = '85+ permanently free LLM API providers with 425+ free models. Auto-probed daily, structured JSON, gateway configs. No credit card required.';

function getGitLastCommitDate() {
  try {
    const date = execSync('git log -1 --format=%cI', { encoding: 'utf8' }).trim();
    return new Date(date);
  } catch {
    return new Date();
  }
}

function getGitCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function loadProviders() {
  const providersPath = path.join(__dirname, '..', 'data', 'providers.json');
  const data = JSON.parse(fs.readFileSync(providersPath, 'utf8'));
  return data.providers || [];
}

function generateSitemap(providers, lastmod) {
  const urls = [
    {
      url: BASE_URL + '/',
      lastmod: lastmod.toISOString().split('T')[0],
      changefreq: 'daily',
      priority: 1.0
    },
    {
      url: BASE_URL + '/data/providers.json',
      lastmod: lastmod.toISOString().split('T')[0],
      changefreq: 'daily',
      priority: 0.8
    },
    {
      url: BASE_URL + '/#providers',
      lastmod: lastmod.toISOString().split('T')[0],
      changefreq: 'daily',
      priority: 0.9
    },
    {
      url: BASE_URL + '/#compare',
      lastmod: lastmod.toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.7
    },
    {
      url: BASE_URL + '/#calculator',
      lastmod: lastmod.toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.7
    },
    {
      url: BASE_URL + '/#speed-test',
      lastmod: lastmod.toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.6
    },
    {
      url: BASE_URL + '/#stack-generator',
      lastmod: lastmod.toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.7
    },
    {
      url: BASE_URL + '/#newsletter',
      lastmod: lastmod.toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.5
    }
  ];

  // Add provider-specific URLs (anchor links to provider cards)
  for (const provider of providers) {
    urls.push({
      url: BASE_URL + '/#providers',
      lastmod: provider.last_probed ? provider.last_probed.split('T')[0] : lastmod.toISOString().split('T')[0],
      changefreq: 'daily',
      priority: 0.6
    });
  }

  const urlEntries = urls.map(u => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
}

function generateFeed(providers, lastmod) {
  const items = providers
    .filter(p => p.last_probed)
    .sort((a, b) => new Date(b.last_probed) - new Date(a.last_probed))
    .slice(0, 20)
    .map(provider => {
      const pubDate = new Date(provider.last_probed);
      const freeModels = provider.free_models || [];
      const modelList = freeModels.slice(0, 5).join(', ') + (freeModels.length > 5 ? '...' : '');
      
      return `    <item>
      <title><![CDATA[${provider.name} - ${provider.tier === 'permanent_free' ? 'Permanent Free' : 'Trial Credit'}]]></title>
      <link>${BASE_URL}/#providers</link>
      <guid isPermaLink="false">${provider.slug}-${pubDate.toISOString()}</guid>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <description><![CDATA[
        <p><strong>${provider.name}</strong> (${provider.tier === 'permanent_free' ? 'Permanent Free' : 'Trial Credit'})</p>
        <p>Free models: ${modelList || 'See provider for details'}</p>
        <p>Region: ${provider.region || 'Global'} | Status: ${provider.status || 'unknown'}</p>
        <p><a href="${provider.website}" target="_blank">Visit Website</a> | <a href="${provider.api_base}" target="_blank">API Endpoint</a></p>
      ]]></description>
      <category>${provider.tier}</category>
      <category>${provider.region || 'global'}</category>
    </item>`;
    }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${SITE_NAME} - Provider Updates]]></title>
    <link>${BASE_URL}/</link>
    <description><![CDATA[${SITE_DESC}]]></description>
    <language>en-US</language>
    <lastBuildDate>${lastmod.toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>Free LLM Atlas Auto-Generator</generator>
    <ttl>1440</ttl>
    <image>
      <url>${BASE_URL}/og-image.png</url>
      <title>${SITE_NAME}</title>
      <link>${BASE_URL}/</link>
    </image>
${items}
  </channel>
</rss>`;
}

function main() {
  console.log('Generating sitemap.xml and feed.xml...');
  
  const providers = loadProviders();
  const lastmod = getGitLastCommitDate();
  const commitHash = getGitCommitHash();
  
  console.log(`Loaded ${providers.length} providers`);
  console.log(`Last commit: ${commitHash} at ${lastmod.toISOString()}`);
  
  const sitemap = generateSitemap(providers, lastmod);
  const feed = generateFeed(providers, lastmod);
  
  fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(__dirname, '..', 'feed.xml'), feed);
  
  console.log('✅ sitemap.xml generated');
  console.log('✅ feed.xml generated');
}

main();