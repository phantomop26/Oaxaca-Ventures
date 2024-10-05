const puppeteer = require('puppeteer');
const fs = require('fs');

// Utility function to delay
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function scrapeGoogleReviews(places) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    for (const place of places) {
        try {
            // Navigate to Google Maps and search for the place
            await page.goto('https://www.google.com/maps', { waitUntil: 'networkidle2', timeout: 60000 });
            await page.type('input#searchboxinput', place);
            await Promise.all([
                page.click('button#searchbox-searchbutton'),
                page.waitForNavigation({ waitUntil: 'networkidle2' })
            ]);
        } catch (error) {
            console.error(`Error navigating to ${place}:`, error);
            continue;
        }

        // Fetch place details
        const placeDetails = await page.evaluate(() => {
            const name = document.querySelector('.DUwDvf.lfPIob')?.innerText || null;
            const address = document.querySelector('[data-item-id="address"] .Io6YTe')?.innerText || null;
            const phone = document.querySelector('[data-item-id="phone"] .Io6YTe')?.innerText || null;
            const ratingElement = document.querySelector('div.F7nice span[aria-hidden="true"]');
            const rating = ratingElement ? ratingElement.innerText : null;
            const reviewCountElement = document.querySelector('span[aria-label*="reviews"]');
            const reviewCount = reviewCountElement ? reviewCountElement.getAttribute('aria-label').match(/\d+/g)[0] : null;
            const websiteElement = document.querySelector('.rogA2c.ITvuef .Io6YTe.fontBodyMedium.kR99db.fdkmkc');
            const website = websiteElement ? websiteElement.innerText.trim() : null;

            return { name, address, phone, rating, totalReviews: reviewCount, website };
        });

        try {
            // Open the reviews tab
            await page.click('button[aria-label*=" reviews"]');
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

        let allReviews = [];
        let scrollCount = 0;
        const maxScrollAttempts = 15; // Limit the number of scroll attempts

        while (scrollCount < maxScrollAttempts) {
            const newReviews = await page.evaluate(async () => {
                const reviewElements = document.querySelectorAll('.jftiEf');
                
                // Click "More" to expand truncated reviews
                for (const review of reviewElements) {
                    const moreButton = review.querySelector('.w8nwRe.kyuRq');
                    if (moreButton) moreButton.click();
                }

                return Array.from(reviewElements).map(review => {
                    const rating = review.querySelector('.fzvQIb')?.innerText || null;
                    const text = review.querySelector('.wiI7pd')?.innerText || null;
                    const user = review.querySelector('.d4r55')?.innerText || 'Anonymous';
                    const date = review.querySelector('.rsqaWe')?.innerText || null;
                    const photos = Array.from(review.querySelectorAll('.Tya61d')).map(photo => {
                        return photo.style.backgroundImage.slice(5, -2); // Extract photo URL
                    });
                    const userInfo = review.querySelector('.RfnDt')?.innerText || null;

                    return rating && text ? { user, rating, text, date, userInfo, photos } : null;
                }).filter(review => review !== null);
            });

            // Merge newly fetched reviews
            allReviews = allReviews.concat(newReviews);

            // Scroll to the next batch of reviews
            const currentHeight = await page.evaluate(() => {
                const scrollableSection = document.querySelector('.m6QErb.DxyBCb.kA9KIf.dS8AEf.XiKgde');
                scrollableSection.scrollBy(0, scrollableSection.scrollHeight);
                return scrollableSection.scrollHeight;
            });

            await delay(2000); // Adjusted delay to give time for the next batch of reviews to load
            scrollCount++;
        }

        // Save the reviews to a file
        const filePath = `${place.replace(/\s+/g, '_')}.json`;
        fs.writeFileSync(filePath, JSON.stringify({ placeDetails, reviews: allReviews }, null, 2), 'utf-8');
        console.log(`Place details and reviews successfully saved to ${filePath}`);
    }

    await browser.close();
}

// List of restaurants to scrape reviews for
const restaurants = [
    "L'Ecole Restaurant, New York",
    "Vin et Fleur, New York",
    "Maison Close, New York",
    "Pasquale Jones, New York",
    "Starbucks, New York",
    "Raoul's, New York",
    "Le Souk New York - Restaurant & Hookah Lounge, New York",
    "Felix Roasting Co., New York",
    "Dos Caminos, New York",
    "Starbucks, New York",
    "La Esquina, New York",
    "Citizens, New York",
    "Champers Social Club, New York",
    "Jack’s Wife Freda, New York",
    "Bar Moga, New York",
    "Bibliotheque Cafe & Winebar, New York",
    "Lucia Pizza, New York",
    "Charley Bird, New York",
    "Caffé Bene, New York",
    "Marcella, New York",
    "Song’ E Napule, New York",
    "Comodo, New York",
    "12 Chairs, New York",
    "Emmett's, New York",
    "Raku Soho, New York",
    "Lupa, New York",
    "Mikaku, New York",
    "19 Cleveland, New York",
    "Café Select, New York",
    "Osteria Morini, New York",
    "Fanelli Cafe, New York",
    "Balthazar, New York",
    "Blue Ribbon, New York",
    "The Dutch, New York",
    "Dominique Ansel Bakery, New York",
    "Miss Lily's (Soho), New York",
    "Sartiano’s, New York",
    "Jane, New York",
    "Da Marcella, New York",
    "Black Tap, New York",
    "Blue Ribbon Brassiere, New York",
    "Arturo's Coal Oven Pizza, New York",
    "Boqueria Soho, New York",
    "lupe's East L.A. Kitchen, New York",
    "Think Coffee, New York",
    "Pepe Rosso, New York",
    "Unnamed Place, New York",
    "Antique Garage, New York",
    "Lure Fishbar, New York",
    "Morgenstern's Finest Ice Cream, New York",
    "Lucky's, New York",
    "Ground Support Café, New York",
    "GMT Tavern, New York",
    "Bosie, New York",
    "Mocha Burger, New York",
    "Molcajete Taqueria, New York",
    "Pera SoHo, New York",
    "Sessanta, New York",
    "Aurora SoHo, New York",
    "Birch Coffee, New York",
    "Her Name Was Carmen, New York",
    "Sadelle’s, New York",
    "Chobani SoHo, New York",
    "La Colombe Coffee Roasters, New York",
    "Papatzu Mexican Restaurant, New York",
    "Pinch Chinese, New York",
    "Sanctuary T, New York",
    "Banter, New York",
    "Carbone, New York",
    "The Woo, New York",
    "Unnamed Place, New York",
    "San Carlo Osteria Piemonte, New York",
    "Despaña, New York",
    "Piccola Cucina, New York",
    "T2 tea, New York",
    "Barolo, New York",
    "Piccola Cucina Estiatorio, New York",
    "King, New York",
    "Unnamed Place, New York",
    "Famous Ben's Pizza, New York",
    "MAMO, New York",
    "Mishka Soho, New York",
    "Bistro les Amis, New York",
    "Tomo21 Sushi, New York",
    "Unnamed Place, New York",
    "Cipriani Downtown NYC, New York",
    "Joe & The Juice, New York",
    "Caput Mundi, New York",
    "Matchaful, New York",
    "Omen Azen, New York",
    "DOMODOMO, New York",
    "Il Corallo Trattoria, New York",
    "Joe & The Juice, New York",
    "Shuka, New York",
    "Eataly - SoHo, New York",
    "Blank Slate, New York",
    "Blank Street Coffeee, New York",
    "Mangia, New York",
    "Beatnic, New York",
    "Panther Coffee, New York",
    "Sui Yoga Studio.Cafe, New York",
    "Mori, New York",
    "Restaurante Félix, New York",
    "Kintsugi, New York",
    "Now or Never, New York",
    "Lucia Alimentari, New York"
]

scrapeGoogleReviews(restaurants);