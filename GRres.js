// const puppeteer = require('puppeteer');
// const fs = require('fs');

// function delay(time) {
//     return new Promise(resolve => setTimeout(resolve, time));
// }

// async function scrapeGoogleReviews(places) {
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();

//     for (const place of places) {
//         console.log(`Searching for: ${place}`);

//         try {
//             await page.goto('https://www.google.com/maps', { waitUntil: 'networkidle2', timeout: 60000 });
//             await page.waitForSelector('input#searchboxinput', { timeout: 10000 });
//             await page.type('input#searchboxinput', place);

//             await page.waitForSelector('button#searchbox-searchbutton', { timeout: 10000 });
//             await page.click('button#searchbox-searchbutton');

//             await page.waitForSelector('.a5H0ec', { timeout: 10000 });
        
        
                  
//         const firstResult = await page.$('.hfpxzc');
//         if (firstResult) {
//             console.log('Clicking the first search result.');
//             await firstResult.click();
//             await delay(3000); // Wait for the place's page to load
//         } else {
//             console.log('First search result not found.');
//             continue; // Skip to the next place if no results found
//         }}catch (error) {
//             console.error(`Error searching for ${place}:`, error);
//             continue; 
//         }

//         const placeDetails = await page.evaluate(() => {
//             const name = document.querySelector('.DUwDvf.lfPIob')?.innerText || null;
//             const category = document.querySelector('.fontBodyMedium .DkEaL')?.innerText || null;
//             const smallDescription = document.querySelector('.DkEaL')?.innerText || null;
//             const address = document.querySelector('.Io6YTe.fontBodyMedium.kR99db.fdkmkc')?.innerText || null;
//             const contactDetails = [...document.querySelectorAll('.RcCsl.fVHpi.w4vB1d.NOE9ve.M0S7ae.AG25L ')]
//                 .map(el => el.innerText.replace(/\n/g, '').trim());

//             const ratingElement = document.querySelector('div.F7nice span[aria-hidden="true"]');
//             const rating = ratingElement ? ratingElement.innerText : null;

//             // Correctly retrieve the total number of reviews
//             const reviewCountElement = document.querySelector('.F7nice span[aria-label*="reviews"]');
//             const reviewCount = reviewCountElement ? reviewCountElement.getAttribute('aria-label').match(/\d{1,3}(,\d{3})*/g)[0] : null;

//             return {
//                 name,
//                 category,
//                 smallDescription,
//                 address,
//                 contactDetails,
//                 rating,  
//                 totalReviews: reviewCount  
//             };
//         });

//         console.log("Place Details:", placeDetails);

//         try {
//             const reviewsTabSelector = 'button[aria-label*=" reviews"]'; 
//             await page.waitForSelector(reviewsTabSelector, { timeout: 10000 });
//             await page.click(reviewsTabSelector);  
//             await delay(2000);  
//         } catch (error) {
//             console.error(`Error navigating to reviews for ${place}:`, error);
//             continue; 
//         }
        
//         const reviewsContainerSelector = '.m6QErb.DxyBCb.kA9KIf.dS8AEf.XiKgde';
//         try {
//             await page.waitForSelector(reviewsContainerSelector, { timeout: 10000 });
//         } catch (error) {
//             console.error(`Error loading reviews for ${place}:`, error);
//             continue; 
//         }
//         console.log("Reviews container found, starting to scrape...");

//         let lastHeight = 0;
//         let retryCounter = 0;
//         const maxRetries = 3;
//         const allReviews = new Set(); 
//         while (true) {
//             const currentHeight = await page.evaluate((selector) => {
//                 const scrollableSection = document.querySelector(selector);
//                 scrollableSection.scrollBy(0, scrollableSection.scrollHeight);
//                 return scrollableSection.scrollHeight;
//             }, reviewsContainerSelector);

//             if (currentHeight > lastHeight) {
//                 lastHeight = currentHeight;
//                 retryCounter = 0; 
//             } else {
//                 retryCounter += 1;
//                 console.log(`No new content, retry attempt ${retryCounter}/${maxRetries}`);

//                 if (retryCounter >= maxRetries) {
//                     console.log("Max retries reached or no more content to scroll. Exiting scrolling loop.");
//                     break;
//                 }
//             }

//             await delay(1000); 
//             const newReviews = await page.evaluate(() => {
//                 const reviewElements = document.querySelectorAll('.jftiEf'); 
//                 return Array.from(reviewElements).map(review => {
//                     const ratingElement = review.querySelector('.fzvQIb'); 
//                     const rating = ratingElement ? ratingElement.innerText : null; 
//                     const textElement = review.querySelector('.wiI7pd'); 
//                     const text = textElement ? textElement.innerText : null; 
//                     const userElement = review.querySelector('.d4r55'); 
//                     const dateElement = review.querySelector('.rsqaWe'); 
//                     const userInfoElement = review.querySelector('.RfnDt'); 

//                     const userInfo = userInfoElement ? userInfoElement.innerText : null;
//                     // Extract user-posted photos
//                     const photoElement = review.querySelector('.Tya61d');
//                     const photoUrl = photoElement ? photoElement.style.backgroundImage.slice(5, -2) : null;

//                     // Extract user profile picture
//                     const userProfilePictureElement = review.querySelector('.d4r55 img[src]');
//                     let userProfilePicture = null;
//                     if (userProfilePictureElement) {
//                         const profileSrc = userProfilePictureElement.getAttribute('src');
//                         if (!profileSrc.includes('gstatic.com/images/branding/product')) {
//                             userProfilePicture = profileSrc;
//                         }
//                     }

//                     // Click the "More" button if it exists to expand the review text
//                     const moreButton = review.querySelector('button[aria-label="See more"]');
//                     if (moreButton) {
//                         moreButton.click();
//                     }

//                     if (rating && text) {
//                         return {
//                             user: userElement ? userElement.innerText : 'Anonymous',
//                             rating,
//                             text,
//                             date: dateElement ? dateElement.innerText : null,
//                             userInfo,
//                             photoUrl,
//                             userProfilePicture,
//                         };
//                     }
//                     return null; 
//                 }).filter(review => review !== null);
//             });

//             newReviews.forEach(review => allReviews.add(JSON.stringify(review)));
//             if (newReviews.length === 0) {
//                 console.log('No new valid reviews found during this scroll iteration. Exiting.');
//                 break;
//             }
//         }

//         const allReviewsArray = Array.from(allReviews).map(review => JSON.parse(review));
//         const filePath = `${place.replace(/\s+/g, '_')}.json`;
//         fs.writeFileSync(filePath, JSON.stringify({ placeDetails, reviews: allReviewsArray }, null, 2), 'utf-8');
//         console.log(`Place details and reviews successfully saved to ${filePath}`);
//     }

//     await browser.close();
// }







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
            const category = document.querySelector('.mgr77e')?.innerText || null;
            const smallDescription = document.querySelector('.AeaXub.rogA2c')?.innerText || null;
            const address = document.querySelector('.Io6YTe.fontBodyMedium.kR99db.fdkmkc')?.innerText || null;
            const contactDetails = [...document.querySelectorAll('.RcCsl.fVHpi.w4vB1d.NOE9ve.M0S7ae.AG25L ')]
                .map(el => el.innerText.replace(/\n/g, '').trim());

            const ratingElement = document.querySelector('div.F7nice span[aria-hidden="true"]');
            const rating = ratingElement ? ratingElement.innerText : null;

            // Correctly retrieve the total number of reviews
            const reviewCountElement = document.querySelector('.F7nice span[aria-label*="reviews"]');
            const reviewCount = reviewCountElement ? reviewCountElement.getAttribute('aria-label').match(/\d{1,3}(,\d{3})*/g)[0] : null;

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
                    const dateElement = review.querySelector('.xRkPPb');
                    const userInfoElement = review.querySelector('.RfnDt');
            
                    const userInfo = userInfoElement ? userInfoElement.innerText : null;
            
                    // Extract all user-posted photos
                    const photoElements = review.querySelectorAll('.Tya61d');
                    const photoUrls = Array.from(photoElements).map(photoElement => photoElement.style.backgroundImage.slice(5, -2));
            
                    // Extract user profile picture
                    const userProfilePictureElement = review.querySelector('.d4r55 img[src]');
                    let userProfilePicture = null;
                    if (userProfilePictureElement) {
                        const profileSrc = userProfilePictureElement.getAttribute('src');
                        if (!profileSrc.includes('gstatic.com/images/branding/product')) {
                            userProfilePicture = profileSrc;
                        }
                    }
            
                    // Click the "More" button if it exists to expand the review text
                    const moreButton = review.querySelector('button[aria-label="See more"]');
                    if (moreButton) {
                        moreButton.click();
                    }
            
                    if (rating && text) {
                        return {
                            user: userElement ? userElement.innerText : 'Anonymous',
                            rating,
                            text,
                            date: dateElement ? dateElement.innerText : null,
                            userInfo,
                            photoUrls, // Save the array of all photo URLs
                            userProfilePicture,
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
        const sanitizedPlaceName = place.replace(/[\s\\/:*?"<>|,]/g, '_');
        const filePath = `${sanitizedPlaceName}.json`;
        fs.writeFileSync(filePath, JSON.stringify({ placeDetails, reviews: allReviewsArray }, null, 2), 'utf-8');
        console.log(`Place details and reviews successfully saved to ${filePath}`);
    }

    await browser.close();
}


const places = [ 'Lotte New York Palace, New York', 'New York Marriott Marquis, New York', 'The Roosevelt Hotel, New York', 'Holiday Inn, New York', 'Club Quarters, New York', 'Innside New York Nomad, New York', 'Eventi, New York', 'Holiday Inn Express, New York', 'The Bowery Hotel, New York', 'Hyatt Union Square New York, New York', 'Sixty SoHo, New York', 'Crosby Street Hotel, New York', 'Unnamed Hotel, New York', 'Unnamed Hotel, New York', 'NoMo SoHo, New York', 'The Hotel @ New York City, New York', 'The Evelyn, New York', 'The Nomad, New York', 'Flatiron Hotel, New York', 'Fairfield Inn, New York', 'Motto By Hilton, New York', 'Unnamed Hotel, New York', 'Hotel MB, New York', 'Wyndham Garden Chinatown, New York', 'Unnamed Hotel, New York', 'Unnamed Hotel, New York', 'Sixty LES, New York', 'Unnamed Hotel, New York', 'Club Wyndham Midtown 45, New York', 'W Hotels, New York', 'Unnamed Hotel, New York', 'Four Points by Sheraton, New York', 'The Dominick, New York', 'Courtyard, New York', 'Unnamed Hotel, New York', 'Hotel Mulberry, New York', 'Hilton Garden Inn Tribeca, New York', 'Roxy Hotel, New York', 'The Ludlow Hotel, New York', 'Unnamed Hotel, New York', 'The Redford Hotel, New York', 'Hotel Richland, New York', 'Hotel Gansevoort, New York', 'The Standard, New York', 'Liberty Inn, New York', 'Soho House New York, New York', 'W Times Square Hotel, New York', 'Hyatt Centric Times Square, New York', 'Chelsea Pines Inn, New York', 'Hotel 309, New York', 'Dream Downtown, New York', 'Maritime Hotel, New York', 'Hampton Inn, New York', 'Hyatt Place, New York', 'Selina Chelsea New York City, New York', 'Midtown West Hotel, New York', 'Holiday Inn Express, New York', 'Unnamed Hotel, New York', 'Hampton, New York', 'Hilton Garden Inn, New York', 'Hotel Indigo, New York', 'Courtyard Marriot, New York', 'DoubleTree, New York', 'Stewart Hotel, New York', 'Hotel 17, New York', 'Lex Hotel NYC, New York', 'Unnamed Hotel, New York', 'Courtyard, New York', 'Unnamed Hotel, New York', 'The Redbury New York, New York', 'Hotel Chandler, New York', 'Best Western Premier, New York', 'Ace Hotel, New York', 'Park Lane Hotel, New York', 'The Ritz-Carlton, New York', 'JW Marriott Essex House, New York', 'AKA Central Park, New York', '1 Hotel Central Park, New York', 'West 57th Street, New York', 'Thompson Central Park New York, New York', 'Unnamed Hotel, New York', 'The Peninsula New York, New York', 'Warwick Hotel, New York', 'The Luxury Collection Hotel Manhattan Midtown, New York', 'Unnamed Hotel, New York', 'Unnamed Hotel, New York', 'Da Vinci Hotel, New York', 'Park Central Hotel, New York', 'Dream Midtown, New York', '6 Columbus, New York', 'The New Yorker, New York', 'The Hotel @ 5th Avenue, New York', 'Life Hotel, New York', 'Hotel Wolcott, New York', 'Hotel Stanford, New York', 'nyma, New York', 'Hyatt Herald Square New York, New York', 'Martinique New York on Broadway, Curio Collection by Hilton, New York', 'The Marmara Park Avenue, New York', 'Hotel 32 32, New York', 'HGU, New York', 'Hotel AKA, New York', 'Murray Hill Marquis, New York', 'Crowne Plaza, New York', 'EVEN Hotel New York - Times Square South, New York', 'Staypineapple, New York', 'Fairfield Inn & Suites, New York', 'Quality Inn, New York', 'Henn Na Hotel, New York', 'Courtyard, New York', 'Doxie Hotel, New York', 'Artel Hotel, New York', 'Element, New York', 'La Quinta Inn & Suites, New York', 'Delta Hotels by Marriott, New York', 'Distrikt Hotel, New York', 'DoubleTree by Hilton Hotel, New York', 'Hyatt Place, New York', 'Hampton, New York', 'Holiday Inn Express, New York', 'Candlewood Suites, New York', 'Holiday Inn, New York', 'Fairfield Inn, New York', 'Hotel Hendricks, New York', 'SpringHill Suites, New York', 'Marriott Vacation Club, New York City, New York', 'The Draper, New York', 'The Gregory Hotel, New York', 'The Kixby, New York', 'Hampton Inn, New York', 'Embassy Suites by Hilton, New York', 'Hilton Garden Inn, New York', 'Archer Hotel, New York', 'The Knickerbocker Hotel, New York', 'Skyline Hotel, New York', 'Ramada, New York', 'Washington Jefferson Hotel, New York', 'Belvedere Hotel, New York', 'The Empire Hotel, New York', 'Four Seasons Hotel, New York', 'Sherry Netherlands, New York', 'The Pierre, New York', 'Courtyard New York Manhattan/Fifth Avenue, New York', 'Hyatt Centric 39th & 5th New York, New York', 'AKA Sutton Place, New York', 'Beekman Tower, New York', 'Hilton Garden Inn, New York', 'The Pod Hotel, New York', 'Vanderbilt YMCA, New York', 'United Nations Apartment Hotel, New York', 'Seton Hotel, New York', 'POD 39, New York', 'Murray Hill East Suites, New York', 'Pestana Park Avenue, New York', 'The William, New York', 'Dylan Hotel, New York', 'The Kitano New York, New York', 'Library Hotel, New York', 'Madison Towers Hotel, New York', 'EVEN Hotel Midtown East, New York', 'The Bernic, New York', 'San Carlos, New York', 'Hotel 48LEX, New York', 'Residence Inn, New York', 'The Lexington, New York', 'Doubletree by Hilton Hotel Metropolitan, New York', 'The Kimberly, New York', 'The Benjamin Royal, New York', 'Unnamed Hotel, New York', 'The Carvi Hotel New York, Ascend Hotel Collection, New York', 'Grand Hyatt New York, New York', 'Gotham Hotel, New York', 'InterContinental New York Times Square, New York', 'The Westin, New York', 'Fairfield Inn & Suites, New York', 'Four Points by Sheraton, New York', 'Aliz Hotel, New York', 'Homewood Suites by Hilton, New York', 'Hilton Garden Inn, New York', 'Hampton, New York', 'Margaritaville Resort, New York', 'Paramount Hotel, New York', 'The Gallivant, New York', 'Mayfair, New York', 'Crowne Plaza Times Square, New York', 'Hilton Garden Inn, New York', 'Algonquin Hotel, New York', 'Casablanca Hotel, New York', 'City Club Hotel, New York', 'Broadway @ Times Square Hotel, New York', 'Room Mate Grace Hotel, New York', 'Hotel St. James, New York', 'Unnamed Hotel, New York', 'Citadines Connect, New York', 'Hard Rock Hotel, New York', 'DoubleTree by Hilton, New York', 'Iroquois New York Hotel, New York', 'Millennium Broadway, New York', 'Night Theater District, New York', 'Royalton New York, New York', 'Sofitel, New York', 'The Chatwal, New York', 'The Muse New York, New York', 'Hotel Riu Plaza, New York', 'The Michelangelo, New York', 'Sheraton New York Times Square Hotel, New York', 'AKA Times Square, New York', 'Unnamed Hotel, New York', 'The Palladin, New York', 'Fitzpatrick, New York', 'Lombardy Hotel, New York', 'Concorde Hotel, New York', 'Hotel 57, New York', 'Plaza Ath�n�e, New York', 'Unnamed Hotel, New York', 'The Carlyle, New York', 'The Surrey, New York', 'The Mark, New York', 'Unnamed Hotel, New York', 'Unnamed Hotel, New York', 'Le Meridien, New York', 'Fairfield Inn & Suites, New York', 'The Phillips Club, New York', 'La Quinta Inn, New York', 'The Lucerne, New York', 'Imperial Court Hotel, New York', 'TownePlace Suites, New York', 'Hilton Garden Inn, New York', 'Renaissance, New York', 'Club Quarters, World Trade Center, New York', 'The Washington New York City, New York', 'Marriott Downtown, New York', 'Millennium, New York', 'Holiday Inn, New York', 'Unnamed Hotel, New York', 'The FiDi Hotel, New York', 'DoubleTree by Hilton New York Downtown, New York', 'Hilton Garden Inn, New York', 'Wall Street Inn, New York', 'Radisson Hotel New York Wall Street, New York', 'Unnamed Hotel, New York', 'Holiday Inn Express, New York', 'Hampton Inn Manhattan-Seaport-Financial District, New York', 'Hotel Mimosa, New York', 'Unnamed Hotel, New York', 'The Pod, New York', 'Fairfield Inn & Suites New York Midtown Manhattan/Penn Station, New York', 'Hotel Le Jolie, New York', 'The William Vale, New York', 'Arlo Williamsburg, New York', 'Box House Hotel, New York', 'Giorgio Hotel, New York', 'Sleep Inn Hotel, New York', 'Mayflower Howard Johnson Hotel, New York', 'Baymont, New York', 'Hampton, New York', 'LIC Hotel, New York', 'Ravel Hotel, New York', 'Z NYC Hotel, New York', 'Wyndham Garden, New York', 'Aloft, New York', 'Hilton Garden Inn, New York', 'Hilton Garden Inn, New York', 'Bryant Park Hotel, New York', 'Riu Plaza Hotel, New York', 'TownePlace Suites, New York', 'Unnamed Hotel, New York', 'The Westin New York, New York', 'Comfort Inn, New York', 'Four Points by Sheraton, New York', 'Aloft Manhattan Downtown, New York', 'LeSoleil, New York', 'Arlo NoMad, New York', 'Best Western, New York', 'Holiday Inn Express, New York', 'Hyatt Place New York/Midtown-South, New York', 'Hyatt House, New York', 'Cambria Hotel & Suites, New York', 'Cassa Hotel, New York', 'Hampton, New York', 'Fairfield Inn New York Manhattan/Financial District, New York', 'PUBLIC, an Ian Schrager hotel, New York', 'Arlo Soho, New York', 'Unnamed Hotel, New York', 'Courtyard New York Downtown Financial District, New York', 'The Cloud One New York-Downtown, New York', 'Hyatt Place, New York', 'AC Hotel, New York', 'Walker Hotel, New York', 'The William Vale, New York', 'Unnamed Hotel, New York', 'LUMA Hotel Times Square, New York', 'Hotel Indigo, New York', 'Virgin Hotel, New York', '1 Hotel Brooklyn Bridge, New York', 'Canal Loft Hotel, New York', 'Hotel Nirvana, New York', 'Unnamed Hotel, New York', 'Hotel 21, New York', 'citizenM, New York', 'Wingate by Wyndham Long Island City, New York', 'DoubleTree, New York', 'SpringHill Suites, New York', 'The Ritz-Carlton, New York', 'Hampton, New York', 'Hotel 50 Bowery, New York', '42 Hotel, New York', 'Hotel Central Times Square, New York', 'Aloft, New York', 'Hotel Indigo, New York', 'The Allen Hotel, New York', 'Pendry Manhattan West, New York', 'Moxy, New York', 'Unnamed Hotel, New York', 'Renaissance New York Chelsea Hotel, New York', 'Made Hotel, New York', 'Warren Street Hotel, New York', 'Best Western Plus Soho Hotel, New York', 'SpringHill Suites, New York', 'Wellington Hotel, New York', 'Washington Square Hotel, New York', 'The Jane, New York', 'The Grand Hotel, New York', 'Oyo Times Square Hotel, New York', 'Astor on the Park, New York', 'Park View Hotel, New York', 'The Plaza, New York']

scrapeGoogleReviews(places);

//'Four Seasons Private Residences New York Downtown, Four Seasons Hotel New York Downtown, New York', 'Nolitan Hotel, New York', 'New York EDITION, New York', 'U Hotel Fifth Avenue, New York', 'Best Western Plaza, New York', 'Residence Inn Manhattan/Times Square, New York', 'Colonial House, New York', 'The Marmara, New York', 'Heritage Hotel, New York', 'The French Quarters Guest Apartments, New York', 'The Mark, New York', 'Orchard Street Hotel, New York', 'Hotel Riu Plaza New York Times Square, New York', 'Mercer Hotel, New York', 'Hotel Hayden, New York', 'Four Points by Sheraton, New York', 'Duane Street Hotel, New York', 'Hoxton, New York', 'Avalon Hotel, New York', 'Sheraton, New York', 'The Gardens Sonesta ES Suites, New York', 'The Fifty Sonesta Select, New York', 'The Shelburne Sonesta, New York', 'McCarren Hotel & Pool, New York', 'Sago Hotel, New York', 'hotel mela, New York', 'Soho Garden Hotel, New York', 'Courtyard New York Downtown Manhattan/World Trade Center Area, New York', 'Club Quarters World Trade, New York', 'The Pod Times Square, New York', 'Club Quarter H�tel, New York', 'The Hotel @ Times Square, New York', 'Park Terrace Hotel, New York', 'The Henry Norman Hotel, New York', 'East Village Hotel, New York', 'Unnamed Hotel, New York', 'Hilton Garden Inn Midtown Park Avenue, New York', 'Paramount Hotel, New York', 'The Franklin, New York', 'Graduate Roosevelt Island, New York', 'The SoLita SoHo Hotel, New York', 'Walker Hotel Tribeca, New York', 'Leon Hotel, New York', 'The Beekman, A Thompson Hotel, New York', 'Madison Les Hotel, New York', 'tba, New York', 'Equinox, New York', 'Four Points by Sheraton Manhattan Chelsea, New York', 'The Wall Street Hotel, New York', 'Truss Hotel Times Square, New York', 'Franklin Guesthouse, New York', 'EnVue, New York', 'Loews Regency, New York', 'AC Hotel, New York', 'Casa Cipriani New York, New York', 'Residence Inn, New York', 'Moxy, New York', 'NYC Glamping, New York', 'Hotel Indigo, New York', 'Arlo, New York', 'Residence Inn, New York', '42-59 Crescent Street Hotel, New York', 'Moxy, New York', 'Springhill Suites, New York', 'Courtyard New York Manhattan/Times Square, New York', 'The High Line Hotel, New York', 'Fairfield Inn & Suites, New York', 'La Quinta, New York', 'Moderne Hotel, New York', 'Holiday Inn Manhattan, New York', 'Waldorf Astoria New York, New York', '400 Fifth Avenue, New York', 'The Hotel Edison NYC, New York', 'InterContinental New York Barclay, New York', 'Hilton New York Midtown, New York', 'Trump International Hotel and Tower, New York', 'Baccarat Hotel & Residences, New York','33 Hotel, New York City, Seaport, New York', 'Hotel91, New York', 'Feather Factory Hotel, New York', 'Andaz, New York', 'Hilton New York Fashion District, New York', 'Park Hyatt New York, New York', 'The Paul, New York', 'Hotel Boutique, New York', 'Club Quarters Hotel, New York', 'Union Square Inn, New York', 'Sunshine Hotel, New York', 'Chelsa Inn Hotel, New York', 'Millennium Hilton One UN Plaza, New York', 'The Townhouse Inn of Chelsea, New York', 'World Hotel, New York', 'The Renwick Hotel, New York', 'The James, New York', 'Chambers Hotel, New York', 'Wyndham Garden Manhattan Chelsea West, New York', 'Unnamed Hotel, New York', 'Mint House, New York', 'citizenM, New York', 'The Wallace, New York', 'Sanctuary Hotel, New York', 'Royalton Park Avenue, New York', 'Radio City Apartment, New York', 'Hotel Belleclaire, New York', 'Hotel Churchill, New York', 'Amsterdam Inn, New York', 'Conrad Midtown, New York', 'The Frederick Hotel, New York', 'Latham, New York', 'Mandarin Oriental, New York', 'Hotel 99, New York', 'The Standard, East Village, New York', 'DoubleTree Suites, New York', 'Clarion Hotel Park Avenue, New York', 'Fitzpatrick Grand Central Hotel, New York', 'adour alan ducasse, New York', 'St Regis, New York', 'Hotel 31, New York', 'TRYP, New York', 'Night Hotel, New York', 'YOTEL, New York', 'Ink 48 Hotel, New York', 'Hotel Beacon, New York', 'W Hotels, New York', 'Senton Hotel, New York', 'Broadway Plaza Hotel, New York', 'Hotel Giraffe, New York', 'Hotel Chelsea, New York', 'The GEM Hotel Chelsea, New York', 'Wythe Hotel, New York', 'Modernhaus SoHo, New York', "St. Mark's Hotel, New York", 'Roger Smith Hotel, New York', 'Sohotel, New York', 'NobleDen, New York', 'The GEM Hotel Soho, New York', 'U.S. Pacific, New York', 'SoHo 54 Hotel, New York', 'The Manhattan at Times Square Hotel, New York', 'The Bentley Hotel, New York', 'Courtyard, New York', 'Renaissance New York Times Square Hotel, New York', 'Carlton Arms Hotel, New York', 'The Marcel, New York', 'Parksouth Hotel, New York', 'The Fifth Avenue Hotel, New York', 'The Quin, New York', 'Mondrian Park Avenue, New York', 'Refinery, New York', 'Americana Inn, New York', 'Westgate New York Grand Central Hotel, New York', '70 Park Avenue Hotel, New York', 'The Msocial, New York', 'Hotel Belnord, New York', 'The Hotel Newton, New York', 'Best Western Convention Center, New York', 'Wagner Hotel, New York', 'Hyatt Centric, New York', 'Eurostars Wall Street Hotel, New York', 'Fairfield Inn New York Manhattan/Financial District, New York',