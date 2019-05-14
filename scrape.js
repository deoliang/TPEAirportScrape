const puppeteer = require('puppeteer');
const url = 'https://www.taoyuan-airport.com/english/flight_depart';
const $ = require('cheerio');
const fs = require('fs');
const dropdownSelector = `select[ng-if="::(type === '01')"]`
const loadingGoneSelector = '#flight-search > div.main_pan_body > div.text-center.text_red.ng-binding.ng-hide'
const TPEDestinations = {
    "Cities": []
}

const uniqueSet = new Set();
puppeteer.launch().then(async browser => {
    const page = await browser.newPage();
    await page.goto(url);
    
    await page.waitForSelector(dropdownSelector)
    await page.waitForSelector(loadingGoneSelector);
    await page.waitFor(500);

    const dropdown = await page.$(dropdownSelector);
    await dropdown.type('--All--');
    await page.waitForSelector(loadingGoneSelector);
    let html = await page.content();

    await $('td:nth-child(5) > div:first-child',html).each(function(i, elem) {
        if(uniqueSet.has($(this).text()))return true;
        uniqueSet.add($(this).text()); 
    });

    TPEDestinations.Cities = await [...uniqueSet].sort();
            
    await fs.writeFile('TPEDestinations.json', JSON.stringify(TPEDestinations), function(err){
        if (err) throw err;
        console.log("Successfully Written to File.");
    });
    await browser.close();
});