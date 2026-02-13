import { config } from '@/config';
import cache from '@/utils/cache';
import puppeteer from '@/utils/puppeteer';
import { getCookies } from '@/utils/puppeteer-utils';

export const parseToken = (_link?: string) =>
    cache.tryGet(
        'xueqiu:token',
        async () => {
            const browser = await puppeteer();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' ? request.continue() : request.abort();
            });
            // 访问行情页获取 cookie（首页有阿里云 WAF 拦截）
            await page.goto('https://xueqiu.com/hq', {
                waitUntil: 'domcontentloaded',
            });
            await page.evaluate(() => document.documentElement.innerHTML);
            const cookies = await getCookies(page);
            return cookies;
        },
        config.cache.routeExpire,
        false
    );
