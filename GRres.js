
// // const puppeteer = require('puppeteer');
// // const fs = require('fs'); 
// // function delay(time) {
// //     return new Promise(resolve => setTimeout(resolve, time));
// // }

// // async function scrapeGoogleReviews(places) {
// //     const browser = await puppeteer.launch({ headless: false });
// //     const page = await browser.newPage();

// //     for (const place of places) {
// //         console.log(`Searching for: ${place}`);

// //         try {
// //             await page.goto('https://www.google.com/maps', { waitUntil: 'networkidle2', timeout: 60000 });
// //             await page.waitForSelector('input#searchboxinput', { timeout: 10000 });
// //             await page.type('input#searchboxinput', place);

// //             await page.waitForSelector('button#searchbox-searchbutton', { timeout: 10000 });
// //             await page.click('button#searchbox-searchbutton');

// //             await page.waitForSelector('.a5H0ec', { timeout: 10000 });
// //         } catch (error) {
// //             console.error(`Error searching for ${place}:`, error);
// //             continue; 
// //         }

// //         const placeDetails = await page.evaluate(() => {
// //             const name = document.querySelector('.DUwDvf.lfPIob')?.innerText || null;
// //             const category = document.querySelector('.fontBodyMedium .DkEaL')?.innerText || null;
// //             const smallDescription = document.querySelector('.DkEaL')?.innerText || null;
// //             const address = document.querySelector('.Io6YTe.fontBodyMedium.kR99db.fdkmkc')?.innerText || null;
// //             const contactDetails = [...document.querySelectorAll('.RcCsl.fVHpi.w4vB1d.NOE9ve.M0S7ae.AG25L .CsEnBe')]
// //                 .map(el => el.innerText.replace(/\n/g, '').trim());

// //             const ratingElement = document.querySelector('div.F7nice span[aria-hidden="true"]');
// //             const rating = ratingElement ? ratingElement.innerText : null;

// //             const reviewCountElement = document.querySelector('span[aria-label*="reviews"]');
// //             const reviewCount = reviewCountElement ? reviewCountElement.getAttribute('aria-label').match(/\d+/g)[0] : null;

// //             return {
// //                 name,
// //                 category,
// //                 smallDescription,
// //                 address,
// //                 contactDetails,
// //                 rating,  
// //                 totalReviews: reviewCount  
// //             };
// //         });

// //         console.log("Place Details:", placeDetails);

// //         try {
// //             const reviewsTabSelector = 'button[aria-label*=" reviews"]'; 
// //             await page.waitForSelector(reviewsTabSelector, { timeout: 10000 });
// //             await page.click(reviewsTabSelector);  

            
// //             await delay(2000);  
// //         } catch (error) {
// //             console.error(`Error navigating to reviews for ${place}:`, error);
// //             continue; 
// //         }
// //         const reviewsContainerSelector = '.m6QErb.DxyBCb.kA9KIf.dS8AEf.XiKgde';
// //         try {
// //             await page.waitForSelector(reviewsContainerSelector, { timeout: 10000 });
// //         } catch (error) {
// //             console.error(`Error loading reviews for ${place}:`, error);
// //             continue; 
// //         }
// //         console.log("Reviews container found, starting to scrape...");

// //         let lastHeight = 0;
// //         let retryCounter = 0;
// //         const maxRetries = 3;
// //         const allReviews = new Set(); 
// //         while (true) {
// //             const currentHeight = await page.evaluate((selector) => {
// //                 const scrollableSection = document.querySelector(selector);
// //                 scrollableSection.scrollBy(0, scrollableSection.scrollHeight);
// //                 return scrollableSection.scrollHeight;
// //             }, reviewsContainerSelector);

// //             if (currentHeight > lastHeight) {
// //                 lastHeight = currentHeight;
// //                 retryCounter = 0; 
// //             } else {
// //                 retryCounter += 1;
// //                 console.log(`No new content, retry attempt ${retryCounter}/${maxRetries}`);

// //                 if (retryCounter >= maxRetries) {
// //                     console.log("Max retries reached or no more content to scroll. Exiting scrolling loop.");
// //                     break;
// //                 }
// //             }

// //             await delay(1000); 
// //             const newReviews = await page.evaluate(() => {
// //                 const reviewElements = document.querySelectorAll('.jftiEf'); 
// //                 return Array.from(reviewElements).map(review => {
// //                     const ratingElement = review.querySelector('.fzvQIb'); 
// //                     const rating = ratingElement ? ratingElement.innerText : null; 
// //                     const textElement = review.querySelector('.wiI7pd'); 
// //                     const text = textElement ? textElement.innerText : null; 
// //                     const userElement = review.querySelector('.d4r55'); 
// //                     const dateElement = review.querySelector('.rsqaWe'); 
// //                     const userInfoElement = review.querySelector('.RfnDt'); 

// //                     const userInfo = userInfoElement ? userInfoElement.innerText : null;

// //                     if (rating && text) {
// //                         return {
// //                             user: userElement ? userElement.innerText : 'Anonymous',
// //                             rating,
// //                             text,
// //                             date: dateElement ? dateElement.innerText : null,
// //                             userInfo 
// //                         };
// //                     }
// //                     return null; 
// //                 }).filter(review => review !== null);
// //             });

// //             newReviews.forEach(review => allReviews.add(JSON.stringify(review)));
// //             if (newReviews.length === 0) {
// //                 console.log('No new valid reviews found during this scroll iteration. Exiting.');
// //                 break;
// //             }
// //         }

// //         const allReviewsArray = Array.from(allReviews).map(review => JSON.parse(review));
// //         const filePath = `${place.replace(/\s+/g, '_')}.json`;
// //         fs.writeFileSync(filePath, JSON.stringify({ placeDetails, reviews: allReviewsArray }, null, 2), 'utf-8');
// //         console.log(`Place details and reviews successfully saved to ${filePath}`);
// //     }

// //     await browser.close();
// // }

// // const places = ['Conrad Midtown, New York', 'The Frederick Hotel, New York', 'The Standard, East Village, New York', 'Wythe Hotel, New York', 'Modernhaus SoHo, New York', "St. Mark's Hotel, New York", 'Sohotel, New York', 'NobleDen, New York', 'The GEM Hotel Soho, New York', 'U.S. Pacific, New York', 'SoHo 54 Hotel, New York', 'Wagner Hotel, New York', 'Hyatt Centric, New York', 'Eurostars Wall Street Hotel, New York', 'Fairfield Inn New York Manhattan/Financial District, New York', '33 Hotel, New York City, Seaport, New York', 'Hotel91, New York', 'Union Square Inn, New York', 'Sunshine Hotel, New York', 'World Hotel, New York', 'Mint House, New York', '49 Crosby, New York', 'JG Sohotel, New York', 'Soho Grand Hotel, New York', 'The William Vale, New York', 'Four Seasons Private Residences New York Downtown;Four Seasons Hotel New York Downtown, New York', 'Nolitan Hotel, New York', 'Orchard Street Hotel, New York', 'Mercer Hotel, New York', 'Four Points by Sheraton, New York', 'Duane Street Hotel, New York', 'Hoxton, New York', 'Sheraton, New York', 'McCarren Hotel & Pool, New York', 'Sago Hotel, New York', 'Soho Garden Hotel, New York', 'Courtyard New York Downtown Manhattan/World Trade Center Area, New York', 'Club Quarters World Trade, New York', 'The Henry Norman Hotel, New York', 'East Village Hotel, New York', 'The SoLita SoHo Hotel, New York', 'Walker Hotel Tribeca, New York', 'Leon Hotel, New York', 'The Beekman, A Thompson Hotel, New York', 'Madison Les Hotel, New York', 'The Wall Street Hotel, New York', 'Franklin Guesthouse, New York', 'Casa Cipriani New York, New York', 'Moxy, New York', 'NYC Glamping, New York', 'Hotel Indigo, New York', 'Residence Inn, New York', 'Fairfield Inn & Suites, New York', 'Holiday Inn Manhattan, New York', 'Holiday Inn, New York', 'The Bowery Hotel, New York', 'Hyatt Union Square New York, New York', 'Sixty SoHo, New York', 'Crosby Street Hotel, New York', 'NoMo SoHo, New York', 'Hotel MB, New York', 'Wyndham Garden Chinatown, New York', 'Sixty LES, New York', 'Four Points by Sheraton, New York', 'The Dominick, New York', 'Courtyard, New York', 'Hotel Mulberry, New York', 'Hilton Garden Inn Tribeca, New York', 'Roxy Hotel, New York', 'The Ludlow Hotel, New York', 'The Redford Hotel, New York', 'Hotel Richland, New York', 'Club Quarters, World Trade Center, New York', 'The Washington New York City, New York', 'Marriott Downtown, New York', 'Millennium, New York', 'Holiday Inn, New York', 'The FiDi Hotel, New York', 'DoubleTree by Hilton New York Downtown, New York', 'Hilton Garden Inn, New York', 'Wall Street Inn, New York', 'Radisson Hotel New York Wall Street, New York', 'Holiday Inn Express, New York', 'Hampton Inn Manhattan-Seaport-Financial District, New York', 'Hotel Mimosa, New York', 'The Pod, New York', 'Hotel Le Jolie, New York', 'The William Vale, New York', 'Arlo Williamsburg, New York', 'Four Points by Sheraton, New York', 'Aloft Manhattan Downtown, New York', 'Fairfield Inn New York Manhattan/Financial District, New York', 'PUBLIC, an Ian Schrager hotel, New York', 'Arlo Soho, New York', 'Courtyard New York Downtown Financial District, New York', 'The Cloud One New York-Downtown, New York', 'AC Hotel, New York', 'The William Vale, New York', 'Hotel Indigo, New York', '1 Hotel Brooklyn Bridge, New York', 'Canal Loft Hotel, New York', 'citizenM, New York', 'Hampton, New York', 'Hotel 50 Bowery, New York', '42 Hotel, New York', 'Hotel Indigo, New York', 'The Allen Hotel, New York', 'Moxy, New York', 'Warren Street Hotel, New York', 'Best Western Plus Soho Hotel, New York', 'Washington Square Hotel, New York'];
// // scrapeGoogleReviews(places);



// // const puppeteer = require('puppeteer');
// // const fs = require('fs'); 
// // function delay(time) {
// //     return new Promise(resolve => setTimeout(resolve, time));
// // }
// // async function scrapeGoogleReviews(places) {
// //     const browser = await puppeteer.launch({ headless: false });
// //     const page = await browser.newPage();

// //     for (const place of places) {
// //         console.log(`Searching for: ${place}`);

// //         try {
// //             await page.goto('https://www.google.com/maps', { waitUntil: 'networkidle2', timeout: 60000 });
// //             await page.waitForSelector('input#searchboxinput', { timeout: 10000 });
// //             await page.type('input#searchboxinput', place);

// //             await page.waitForSelector('button#searchbox-searchbutton', { timeout: 10000 });
// //             await page.click('button#searchbox-searchbutton');

// //             await page.waitForSelector('.a5H0ec', { timeout: 10000 });
// //         } catch (error) {
// //             console.error(`Error searching for ${place}:`, error);
// //             continue; 
// //         }

// //         const placeDetails = await page.evaluate(() => {
// //             const name = document.querySelector('.DUwDvf.lfPIob')?.innerText || null;
// //             const category = document.querySelector('.fontBodyMedium .DkEaL')?.innerText || null;
// //             const smallDescription = document.querySelector('.DkEaL')?.innerText || null;
// //             const address = document.querySelector('.Io6YTe.fontBodyMedium.kR99db.fdkmkc')?.innerText || null;
// //             const contactDetails = [...document.querySelectorAll('.RcCsl.fVHpi.w4vB1d.NOE9ve.M0S7ae.AG25L .CsEnBe')]
// //                 .map(el => el.innerText.replace(/\n/g, '').trim());

// //             const ratingElement = document.querySelector('div.F7nice span[aria-hidden="true"]');
// //             const rating = ratingElement ? ratingElement.innerText : null;

// //             const reviewCountElement = document.querySelector('span[aria-label*="reviews"]');
// //             const reviewCount = reviewCountElement ? reviewCountElement.getAttribute('aria-label').match(/\d+/g)[0] : null;

// //             return {
// //                 name,
// //                 category,
// //                 smallDescription,
// //                 address,
// //                 contactDetails,
// //                 rating,  
// //                 totalReviews: reviewCount  
// //             };
// //         });

// //         console.log("Place Details:", placeDetails);

// //         try {
// //             const reviewsTabSelector = 'button[aria-label*=" reviews"]'; 
// //             await page.waitForSelector(reviewsTabSelector, { timeout: 10000 });
// //             await page.click(reviewsTabSelector);  
// //             await delay(2000);  
// //         } catch (error) {
// //             console.error(`Error navigating to reviews for ${place}:`, error);
// //             continue; 
// //         }

// //         const reviewsContainerSelector = '.m6QErb.DxyBCb.kA9KIf.dS8AEf.XiKgde';
// //         try {
// //             await page.waitForSelector(reviewsContainerSelector, { timeout: 10000 });
// //         } catch (error) {
// //             console.error(`Error loading reviews for ${place}:`, error);
// //             continue; 
// //         }

// //         console.log("Reviews container found, starting to scrape...");

// //         let lastHeight = 0;
// //         let retryCounter = 0;
// //         const maxRetries = 3;
// //         const allReviews = new Set(); 
// //         while (true) {
// //             const currentHeight = await page.evaluate((selector) => {
// //                 const scrollableSection = document.querySelector(selector);
// //                 scrollableSection.scrollBy(0, scrollableSection.scrollHeight);
// //                 return scrollableSection.scrollHeight;
// //             }, reviewsContainerSelector);

// //             if (currentHeight > lastHeight) {
// //                 lastHeight = currentHeight;
// //                 retryCounter = 0; 
// //             } else {
// //                 retryCounter += 1;
// //                 console.log(`No new content, retry attempt ${retryCounter}/${maxRetries}`);

// //                 if (retryCounter >= maxRetries) {
// //                     console.log("Max retries reached or no more content to scroll. Exiting scrolling loop.");
// //                     break;
// //                 }
// //             }

// //             await delay(1000); 
// //             const newReviews = await page.evaluate(() => {
// //                 const reviewElements = document.querySelectorAll('.jftiEf'); 
// //                 return Array.from(reviewElements).map(review => {
// //                     const ratingElement = review.querySelector('.fzvQIb'); 
// //                     const rating = ratingElement ? ratingElement.innerText : null; 
// //                     const textElement = review.querySelector('.wiI7pd'); 
// //                     const text = textElement ? textElement.innerText : null; 
// //                     const userElement = review.querySelector('.d4r55'); 
// //                     const dateElement = review.querySelector('.rsqaWe'); 
// //                     const userInfoElement = review.querySelector('.RfnDt'); 

// //                     const userInfo = userInfoElement ? userInfoElement.innerText : null;

// //                     if (rating && text) {
// //                         return {
// //                             user: userElement ? userElement.innerText : 'Anonymous',
// //                             rating,
// //                             text,
// //                             date: dateElement ? dateElement.innerText : null,
// //                             userInfo 
// //                         };
// //                     }
// //                     return null; 
// //                 }).filter(review => review !== null);
// //             });

// //             newReviews.forEach(review => allReviews.add(JSON.stringify(review)));
// //             if (newReviews.length === 0) {
// //                 console.log('No new valid reviews found during this scroll iteration. Exiting.');
// //                 break;
// //             }
// //         }

// //         const allReviewsArray = Array.from(allReviews).map(review => JSON.parse(review));
// //         const filePath = `${place.replace(/\s+/g, '_')}.json`;
// //         fs.writeFileSync(filePath, JSON.stringify({ placeDetails, reviews: allReviewsArray }, null, 2), 'utf-8');
// //         console.log(`Place details and reviews successfully saved to ${filePath}`);
// //     }

// //     await browser.close();
// // }

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
//         } catch (error) {
//             console.error(`Error searching for ${place}:`, error);
//             continue; 
//         }

//         const placeDetails = await page.evaluate(() => {
//             const name = document.querySelector('.DUwDvf.lfPIob')?.innerText || null;
//             const address = document.querySelector('.Io6YTe.fontBodyMedium.kR99db.fdkmkc')?.innerText || null;
//             const contactDetails = [...document.querySelectorAll('.RcCsl.fVHpi.w4vB1d.NOE9ve.M0S7ae.AG25L .CsEnBe')]
//                 .map(el => el.innerText.replace(/\n/g, '').trim());

//             const ratingElement = document.querySelector('div.F7nice span[aria-hidden="true"]');
//             const rating = ratingElement ? ratingElement.innerText : null;

//             const reviewCountElement = document.querySelector('span[aria-label*="reviews"]');
//             const reviewCount = reviewCountElement ? reviewCountElement.getAttribute('aria-label').match(/\d+/g)[0] : null;

//             return {
//                 name,
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

//             const newReviews = await page.evaluate(async () => {
//                 const reviewElements = document.querySelectorAll('.jftiEf'); 
//                 const reviews = [];

//                 for (const review of reviewElements) {
//                     const ratingElement = review.querySelector('.fzvQIb'); 
//                     const rating = ratingElement ? ratingElement.innerText : null; 
//                     const userElement = review.querySelector('.d4r55'); 
//                     const dateElement = review.querySelector('.rsqaWe'); 
//                     const userInfoElement = review.querySelector('.RfnDt'); 
//                     const userInfo = userInfoElement ? userInfoElement.innerText : null;

//                     // Click the "More" button if it exists
//                     const moreButton = review.querySelector('button[aria-label="See more"]');
//                     if (moreButton) {
//                         moreButton.click();  // Click the "More" button to expand the review
//                         await new Promise(resolve => setTimeout(resolve, 500)); // Wait for the text to expand
//                     }

//                     const textElement = review.querySelector('.wiI7pd'); 
//                     const text = textElement ? textElement.innerText : null; 

//                     if (rating && text) {
//                         reviews.push({
//                             user: userElement ? userElement.innerText : 'Anonymous',
//                             rating,
//                             text,
//                             date: dateElement ? dateElement.innerText : null,
//                             userInfo 
//                         });
//                     }
//                 }
//                 return reviews;
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
            const category = document.querySelector('.fontBodyMedium .DkEaL')?.innerText || null;
            const smallDescription = document.querySelector('.DkEaL')?.innerText || null;
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
                    const dateElement = review.querySelector('.rsqaWe'); 
                    const userInfoElement = review.querySelector('.RfnDt'); 

                    const userInfo = userInfoElement ? userInfoElement.innerText : null;

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


const places = ["Shuka, Soho"]

scrapeGoogleReviews(places);