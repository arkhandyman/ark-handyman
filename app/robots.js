import { siteConfig } from '@/lib/data'

export default function robots() {
  return {
    rules: [
      // All crawlers: full access
      {
        userAgent: '*',
        allow: '/',
      },
      // Named AI crawlers — explicit allow so they index the business
      // and surface it in AI-powered search (Perplexity, ChatGPT, etc.)
      { userAgent: 'GPTBot',           allow: '/' },
      { userAgent: 'ChatGPT-User',     allow: '/' },
      { userAgent: 'OAI-SearchBot',    allow: '/' },
      { userAgent: 'Google-Extended',  allow: '/' },
      { userAgent: 'Googlebot',        allow: '/' },
      { userAgent: 'Bingbot',          allow: '/' },
      { userAgent: 'anthropic-ai',     allow: '/' },
      { userAgent: 'ClaudeBot',        allow: '/' },
      { userAgent: 'Claude-Web',       allow: '/' },
      { userAgent: 'PerplexityBot',    allow: '/' },
      { userAgent: 'cohere-ai',        allow: '/' },
      { userAgent: 'Applebot',         allow: '/' },
      { userAgent: 'Applebot-Extended',allow: '/' },
      { userAgent: 'Bytespider',       allow: '/' },
      { userAgent: 'FacebookBot',      allow: '/' },
      { userAgent: 'meta-externalagent', allow: '/' },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
