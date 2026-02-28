import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

  console.log('Navigating to http://localhost:4321');
  await page.goto('http://localhost:4321');

  const formStatus = await page.$('[data-form-status]');
  console.log('Form status text before click:', await formStatus.innerText());

  console.log('Clicking the button without entering email...');
  await page.click('button[type="submit"]');

  // Wait to see if there is navigation or errors
  await page.waitForTimeout(1000);

  console.log('Form status text after click:', await formStatus.innerText());

  await browser.close();
})();
