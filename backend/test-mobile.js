const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 }); // Mobile dimensions
  
  await page.goto('http://localhost:5051', { waitUntil: 'networkidle0' });
  
  // Wait for initial load
  await page.waitForTimeout(2000);
  
  // Try taking a screenshot
  await page.screenshot({ path: 'mobile-view.png' });
  
  // See what the panel contains
  const panelHtml = await page.evaluate(() => document.getElementById('panel').outerHTML);
  console.log("Panel HTML length:", panelHtml.length);
  if (panelHtml.length < 500) {
      console.log("Panel is practically empty:", panelHtml);
  }
  
  const displayStyle = await page.evaluate(() => window.getComputedStyle(document.getElementById('panel')).display);
  console.log("Panel display:", displayStyle);
  
  const visibility = await page.evaluate(() => window.getComputedStyle(document.getElementById('panel')).visibility);
  console.log("Panel visibility:", visibility);
  
  await browser.close();
})();
