/**
 * Scrape Gingr Whiteboard for Kennel Assignments
 * Uses Puppeteer to extract reservation → kennel mappings
 */

import puppeteer from 'puppeteer';
import { createWriteStream } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

const GINGR_CONFIG = {
  subdomain: 'tailtownpetresort',
  apiKey: 'c84c09ecfacdf23a495505d2ae1df533',
  whiteboardUrl: 'https://tailtownpetresort.gingrapp.com/front_end/digital_whiteboard',
  locationId: '1'
};

const TENANT_ID = 'dev';

// Dates to scrape (we'll do a sample of dates with known reservations)
const DATES_TO_SCRAPE = [
  '2025-06-15',
  '2025-07-15',
  '2025-08-15',
  '2025-09-15',
  '2025-10-15',
  '2025-11-15'
];

async function scrapeWhiteboardForDate(page, date) {
  console.log(`\nScraping whiteboard for ${date}...`);
  
  const url = `${GINGR_CONFIG.whiteboardUrl}?key=${GINGR_CONFIG.apiKey}&location_id=${GINGR_CONFIG.locationId}&date=${date}&full_day=true`;
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Extract kennel assignments
    const assignments = await page.evaluate(() => {
      const results = [];
      
      // Look for kennel/suite elements - adjust selectors based on actual HTML structure
      // This is a placeholder - we'll need to inspect the actual page structure
      const kennelElements = document.querySelectorAll('[data-kennel], [data-suite], .kennel-row, .suite-row');
      
      kennelElements.forEach(element => {
        const kennelName = element.getAttribute('data-kennel') || 
                          element.getAttribute('data-suite') ||
                          element.querySelector('.kennel-name, .suite-name')?.textContent?.trim();
        
        const petName = element.querySelector('.pet-name, .animal-name')?.textContent?.trim();
        const reservationId = element.getAttribute('data-reservation-id');
        
        if (kennelName && (petName || reservationId)) {
          results.push({
            kennelName,
            petName,
            reservationId,
            date
          });
        }
      });
      
      return results;
    });
    
    console.log(`  Found ${assignments.length} kennel assignments`);
    return assignments;
    
  } catch (error) {
    console.error(`  Error scraping ${date}:`, error.message);
    return [];
  }
}

async function scrapeWhiteboard() {
  console.log('Starting Gingr whiteboard scraper...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    const allAssignments = [];
    
    // Scrape each date
    for (const date of DATES_TO_SCRAPE) {
      const assignments = await scrapeWhiteboardForDate(page, date);
      allAssignments.push(...assignments);
      
      // Be nice to the server
      await page.waitForTimeout(1000);
    }
    
    console.log(`\n✅ Total assignments scraped: ${allAssignments.length}`);
    
    // Save to JSON file for inspection
    const fs = await import('fs');
    fs.writeFileSync(
      '/tmp/gingr-whiteboard-scrape.json',
      JSON.stringify(allAssignments, null, 2)
    );
    
    console.log('Saved to: /tmp/gingr-whiteboard-scrape.json');
    console.log('\nSample assignments:');
    console.log(JSON.stringify(allAssignments.slice(0, 5), null, 2));
    
  } finally {
    await browser.close();
  }
}

// Run the scraper
scrapeWhiteboard().catch(error => {
  console.error('Scraper failed:', error);
  process.exit(1);
});
