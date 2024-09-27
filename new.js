const puppeteer = require('puppeteer');

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
async function scrapeGoogleReviews(url) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle2' });
    await delay(5000); 

    const reviewsButtonSelector = 'button[aria-label="Reviews for New York Women in Business (NYWIB)"]';
    await page.waitForSelector(reviewsButtonSelector);
    await page.click(reviewsButtonSelector);

    await delay(5000); 

    const reviewsContainerSelector = '.m6QErb.XiKgde'; 
    await page.waitForSelector(reviewsContainerSelector, { timeout: 60000 });

    const reviews = await page.evaluate(() => {
        const reviewElements = document.querySelectorAll('.m6QErb.XiKgde'); 
        return Array.from(reviewElements).map(review => {
            const ratingElement = review.querySelector('.section-review-stars');
            const rating = ratingElement ? ratingElement.getAttribute('aria-label') : 'No rating';
            const textElement = review.querySelector('.section-review-content');
            const text = textElement ? textElement.innerText : 'No review text';
            return { rating, text };
        });
    });
    console.log(reviews);
    await browser.close();
}


scrapeGoogleReviews('https://www.google.com/maps/place/New+York+Women+in+Business+(NYWIB)/@40.7155284,-74.0054565,18z/data=!3m1!5s0x89c25a21aafec183:0x9ec73ffe0b31ec02!4m6!3m5!1s0x89c25b5879b80f51:0x1849dbc5ffe09749!8m2!3d40.7154817!4d-74.0042173!16s%2Fg%2F11pgthv9b1?entry=ttu&g_ep=EgoyMDI0MDkyNC4wIKXMDSoASAFQAw%3D%3D');
