const puppeteer = require('puppeteer');
const fs = require('fs'); 
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function scrapeGoogleReviews(places) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    for (const place of places) {
        console.log(`Searching for: ${place}`);

        try {
            await page.goto('https://www.google.com/maps', { waitUntil: 'networkidle2', timeout: 60000 });
            await page.waitForSelector('input#searchboxinput', { timeout: 10000 });
            await page.type('input#searchboxinput', place);

            await page.waitForSelector('button#searchbox-searchbutton', { timeout: 10000 });
            await page.click('button#searchbox-searchbutton');

            await page.waitForSelector('.a5H0ec', { timeout: 10000 });
        } catch (error) {
            console.error(`Error searching for ${place}:`, error);
            continue; 
        }

        const placeDetails = await page.evaluate(() => {
            const name = document.querySelector('.DUwDvf.lfPIob')?.innerText || null;
            const category = document.querySelector('.fontBodyMedium .DkEaL')?.innerText || null;
            const smallDescription = document.querySelector('.DkEaL')?.innerText || null;
            const address = document.querySelector('.Io6YTe.fontBodyMedium.kR99db.fdkmkc')?.innerText || null;
            const contactDetails = [...document.querySelectorAll('.RcCsl.fVHpi.w4vB1d.NOE9ve.M0S7ae.AG25L .CsEnBe')]
                .map(el => el.innerText.replace(/\n/g, '').trim());

            const ratingElement = document.querySelector('div.F7nice span[aria-hidden="true"]');
            const rating = ratingElement ? ratingElement.innerText : null;

            const reviewCountElement = document.querySelector('span[aria-label*="reviews"]');
            const reviewCount = reviewCountElement ? reviewCountElement.getAttribute('aria-label').match(/\d+/g)[0] : null;

            return {
                name,
                category,
                smallDescription,
                address,
                contactDetails,
                rating,  
                totalReviews: reviewCount  
            };
        });

        console.log("Place Details:", placeDetails);

        try {
            const reviewsTabSelector = 'button[aria-label*=" reviews"]'; 
            await page.waitForSelector(reviewsTabSelector, { timeout: 10000 });
            await page.click(reviewsTabSelector);  

            
            await delay(2000);  
        } catch (error) {
            console.error(`Error navigating to reviews for ${place}:`, error);
            continue; 
        }
        const reviewsContainerSelector = '.m6QErb.DxyBCb.kA9KIf.dS8AEf.XiKgde';
        try {
            await page.waitForSelector(reviewsContainerSelector, { timeout: 10000 });
        } catch (error) {
            console.error(`Error loading reviews for ${place}:`, error);
            continue; 
        }
        console.log("Reviews container found, starting to scrape...");

        let lastHeight = 0;
        let retryCounter = 0;
        const maxRetries = 3;
        const allReviews = new Set(); 
        while (true) {
            const currentHeight = await page.evaluate((selector) => {
                const scrollableSection = document.querySelector(selector);
                scrollableSection.scrollBy(0, scrollableSection.scrollHeight);
                return scrollableSection.scrollHeight;
            }, reviewsContainerSelector);

            if (currentHeight > lastHeight) {
                lastHeight = currentHeight;
                retryCounter = 0; 
            } else {
                retryCounter += 1;
                console.log(`No new content, retry attempt ${retryCounter}/${maxRetries}`);

                if (retryCounter >= maxRetries) {
                    console.log("Max retries reached or no more content to scroll. Exiting scrolling loop.");
                    break;
                }
            }

            await delay(1000); 
            const newReviews = await page.evaluate(() => {
                const reviewElements = document.querySelectorAll('.jftiEf'); 
                return Array.from(reviewElements).map(review => {
                    const ratingElement = review.querySelector('.fzvQIb'); 
                    const rating = ratingElement ? ratingElement.innerText : null; 
                    const textElement = review.querySelector('.wiI7pd'); 
                    const text = textElement ? textElement.innerText : null; 
                    const userElement = review.querySelector('.d4r55'); 
                    const dateElement = review.querySelector('.rsqaWe'); 
                    const userInfoElement = review.querySelector('.RfnDt'); 

                    const userInfo = userInfoElement ? userInfoElement.innerText : null;

                    if (rating && text) {
                        return {
                            user: userElement ? userElement.innerText : 'Anonymous',
                            rating,
                            text,
                            date: dateElement ? dateElement.innerText : null,
                            userInfo 
                        };
                    }
                    return null; 
                }).filter(review => review !== null);
            });

            newReviews.forEach(review => allReviews.add(JSON.stringify(review)));
            if (newReviews.length === 0) {
                console.log('No new valid reviews found during this scroll iteration. Exiting.');
                break;
            }
        }

        const allReviewsArray = Array.from(allReviews).map(review => JSON.parse(review));
        const filePath = `${place.replace(/\s+/g, '_')}.json`;
        fs.writeFileSync(filePath, JSON.stringify({ placeDetails, reviews: allReviewsArray }, null, 2), 'utf-8');
        console.log(`Place details and reviews successfully saved to ${filePath}`);
    }

    await browser.close();
}

const places = [
    "Walker Hotel Tribeca, New York",
];
scrapeGoogleReviews(places);
