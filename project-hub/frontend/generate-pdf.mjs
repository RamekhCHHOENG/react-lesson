import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'presentation.html');
const outputPath = path.join(__dirname, 'presentation.pdf');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  const totalSlides = await page.evaluate(() =>
    document.querySelectorAll('.slide[data-slide]').length
  );
  console.log(`Found ${totalSlides} slides`);

  // Show ALL slides at once, stacked vertically, then print  
  await page.evaluate((total) => {
    // Hide nav/progress
    document.querySelector('.nav')?.remove();
    document.getElementById('progress')?.remove();

    // Reset container
    const container = document.querySelector('.slide-container');
    container.style.cssText = 'width:1920px;height:auto;overflow:visible;position:relative;display:flex;flex-direction:column;';

    // Make body scrollable
    document.body.style.cssText = 'overflow:visible;height:auto;';
    document.documentElement.style.cssText = 'overflow:visible;height:auto;';

    // Show all slides
    document.querySelectorAll('.slide').forEach((s, idx) => {
      s.style.cssText = `
        position:relative !important;
        display:flex !important;
        opacity:1 !important;
        width:1920px;
        height:1080px;
        min-height:1080px;
        max-height:1080px;
        flex-shrink:0;
        overflow:hidden;
        page-break-after:always;
        break-after:page;
      `;
      s.classList.add('active');
      // Complete all animations
      s.querySelectorAll('.animate').forEach(el => {
        el.style.animation = 'none';
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    });

    // Add print styles
    const style = document.createElement('style');
    style.textContent = `
      @page { size: 1920px 1080px; margin: 0; }
      @media print {
        body { overflow: visible !important; }
        .slide { page-break-after: always !important; break-after: page !important; position: relative !important; display: flex !important; opacity: 1 !important; }
        .slide:last-child { page-break-after: auto !important; }
      }
    `;
    document.head.appendChild(style);
  }, totalSlides);

  await new Promise(r => setTimeout(r, 1000));

  await page.pdf({
    path: outputPath,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    timeout: 120000,
  });
await page.pdf({
    path: outputPath,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    timeout: 120000,
  });

  const size = fs.statSync(outputPath).size;
  console.log(`PDF saved: ${outputPath} (${(size / 1024 / 1024).toFixed(1)} MB)`);
  await browser.close();
})();
