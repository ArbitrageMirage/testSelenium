const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');

async function scrapeCatalogInfoAndDownloadPDFs() {
    const driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.get('https://www.tus.si/aktualno/katalogi-in-revije/');
        await driver.wait(until.elementLocated(By.css('.catalogues-grid')), 10000);
        const catalogElements = await driver.findElements(By.css('.catalogues-grid li'));
        const catalogs = [];

        for (const catalogElement of catalogElements) {
            const nameElement = await catalogElement.findElement(By.css('h3 a'));
            const name = await nameElement.getText();
            const link = await nameElement.getAttribute('href');
            const datesElement = await catalogElement.findElement(By.css('p'));
            const startDate = await datesElement.findElement(By.css('time:nth-child(1)')).getAttribute('datetime');
            const endDate = await datesElement.findElement(By.css('time:nth-child(2)')).getAttribute('datetime');
            const pdfLink = await catalogElement.findElement(By.css('a.link-icon.solid.pdf')).getAttribute('href');

            const catalogInfo = {
                name: name,
                link: link,
                startDate: startDate,
                endDate: endDate,
                pdfLink: pdfLink
            };


            const pdfFilename = `${name.replace(/\s+/g, '_')}.pdf`;
            await downloadPDF(pdfLink, pdfFilename);
            catalogInfo.pdfFilename = pdfFilename;

            catalogs.push(catalogInfo);
        }

        const jsonData = JSON.stringify(catalogs, null, 2);
        fs.writeFileSync('catalogs.json', jsonData);
        console.log('Information about catalogs saved in the file catalogs.json');
    } finally {
        await driver.quit();
    }
}

async function downloadPDF(url, filename) {
    const fetchModule = await import('node-fetch');
    const response = await fetchModule.default(url);
    const buffer = await response.buffer();
    fs.writeFileSync(filename, buffer);
    console.log(`File ${filename} successfully downloaded.`);
}

scrapeCatalogInfoAndDownloadPDFs().catch(console.error);
