const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeData() {
    const browser = await puppeteer.launch({ headless: false }); 
    const page = await browser.newPage();

    await page.goto('https://www.yelp.com/biz/walker-hotel-greenwich-village-new-york-2', { waitUntil: 'load', timeout: 0 });

    const hotelName = await page.evaluate(() => {
        const element = document.querySelector('h1.y-css-olzveb');
        return element ? element.innerText : null; 
    });

    const hotelRating = await page.evaluate(() => {
        const ratingElement = document.querySelector('div.y-css-1om4a3q[aria-label]');
        return ratingElement ? ratingElement.getAttribute('aria-label') : null;
    });

    const totalReviews = await page.evaluate(() => {
        const reviewsElement = document.querySelector('span.y-css-loq5qn > a.y-css-12ly5yx');
        return reviewsElement ? reviewsElement.innerText : null;
    });

    const hotelPrice = await page.evaluate(() => {
        const priceElement = document.querySelector('span.y-css-33yfe');
        return priceElement ? priceElement.innerText : null;
    });

    const hotelCategory = await page.evaluate(() => {
        const categoryElements = document.querySelectorAll('span.y-css-kw85nd > a.y-css-12ly5yx');
        return Array.from(categoryElements).map(el => el.innerText).filter(text => text.length > 0); // Capture all categories
    });

    const reviewHighlights = await page.evaluate(() => {
        const reviewHighlightElements = document.querySelectorAll('div.arrange__09f24__LDfbs p.y-css-1s3mozr');
        return Array.from(reviewHighlightElements)
            .map(el => el.innerText.replace(/“|”/g, '').trim())
            .filter(text => text.length > 0); 
    });

    const address = await page.evaluate(() => {
        const streetElement = document.querySelector('p.y-css-r4s27p > a > span.raw__09f24__T4Ezm');
        const cityElement = document.querySelector('p.y-css-sauewc > span.raw__09f24__T4Ezm');
        const street = streetElement ? streetElement.innerText : '';
        const city = cityElement ? cityElement.innerText : '';
        
        return street && city ? `${street}, ${city}` : null; 
    });

    const formattedAddress = address ? `Address: ${address}` : null;

    const hotelData = {
        hotelName,
        hotelRating,
        totalReviews,
        hotelPrice,
        hotelCategory,
        reviewHighlights,
        formattedAddress, 
    };

    fs.writeFileSync('hotelData.json', JSON.stringify(hotelData, null, 2), 'utf-8'); // Use pretty print

    await browser.close(); 
}

scrapeData().catch(console.error); 
