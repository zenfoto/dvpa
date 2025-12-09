// build.js - Static site generator for DVPA with modular templates

const fs = require("fs");
const path = require("path");

const contentDir = path.join(__dirname, "../content/portfolios");
const pageDir = path.join(__dirname, "../content/pages");
const outputDir = path.join(__dirname, "../public/portfolios");
const pageOutputDir = path.join(__dirname, "../public");
const photoTemplatePath = path.join(__dirname, "../templates/photograph.html");
const pageTemplatePath = path.join(__dirname, "../templates/page.html");
const sectionTemplatePath = path.join(__dirname, "../templates/section.html");
const headerPath = path.join(__dirname, "../templates/header.html");
const footerPath = path.join(__dirname, "../templates/footer.html");

const photoTemplate = fs.readFileSync(photoTemplatePath, "utf-8");
const pageTemplate = fs.readFileSync(pageTemplatePath, "utf-8");
const sectionTemplate = fs.readFileSync(sectionTemplatePath, "utf-8");
const header = fs.readFileSync(headerPath, "utf-8");
const footer = fs.readFileSync(footerPath, "utf-8");

function buildImagePages() {
  const categories = fs.readdirSync(contentDir);

  categories.forEach((category) => {
    const categoryPath = path.join(contentDir, category);
    const files = fs.readdirSync(categoryPath).filter(file => file.endsWith(".json") && file !== "index.json");


    const dataObjects = files.map(file => {
      const filePath = path.join(categoryPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return { data, fileName: file };
    });

    // Sort by the 'order' field
    dataObjects.sort((a, b) => a.data.order - b.data.order);

    dataObjects.forEach((entry, index) => {
      const data = entry.data;
      const prev = index > 0 ? dataObjects[index - 1].data.slug : null;
      const next = index < dataObjects.length - 1 ? dataObjects[index + 1].data.slug : null;

      const prevLink = prev ? `<a class="button gallery prev" href="${prev}.html">❮❮</a>` : "";
      const nextLink = next ? `<a class="button gallery next" href="${next}.html">❯❯</a>` : "";

      let html = photoTemplate
        .replace(/{{header}}/g, header)
        .replace(/{{footer}}/g, footer)
        .replace(/{{title}}/g, data.title)
        .replace(/{{body-id}}/g, data.title)
        .replace(/{{image}}/g, data.image)
        .replace(/{{image-home}}/g, data["image-home"])
        .replace(/{{image-biz}}/g, data["image-biz"])
        .replace(/{{image-width}}/g, data["image-width"])
        .replace(/{{image-height}}/g, data["image-height"])
        .replace(/{{location}}/g, data.location)
        .replace(/{{place}}/g, data.place)
        .replace(/{{print-type}}/g, data["print-type"])
        .replace(/{{edition-type}}/g, data["edition-type"])
        .replace(/{{field-notes}}/g, data["field-notes"])
        .replace(/{{prev-link}}/g, prevLink)
        .replace(/{{next-link}}/g, nextLink);

      const outputCategoryDir = path.join(outputDir, category);
      if (!fs.existsSync(outputCategoryDir)) fs.mkdirSync(outputCategoryDir, { recursive: true });

      const outputFile = path.join(outputCategoryDir, `${data.slug}.html`);
      fs.writeFileSync(outputFile, html);
      console.log(`Generated image page: ${outputFile}`);
    });
  });
}

function buildSectionPages() {
  const files = fs.readdirSync(pageDir, { withFileTypes: true });

  files.forEach(file => {
    if (file.isDirectory()) {
      const sectionFolder = file.name;
      const sectionPath = path.join(pageDir, sectionFolder);
      const sectionIndexPath = path.join(sectionPath, "index.json");

      if (!fs.existsSync(sectionIndexPath)) return;

      const sectionData = JSON.parse(fs.readFileSync(sectionIndexPath, "utf-8"));
      const allFiles = fs.readdirSync(sectionPath).filter(f => f.endsWith(".json") && f !== "index.json");

      // Sort by title for now (or modify as needed)
      const pages = allFiles.map(file => {
        const pageData = JSON.parse(fs.readFileSync(path.join(sectionPath, file), "utf-8"));
        return { ...pageData, fileName: file };
      }).sort((a, b) => (a.title || "").localeCompare(b.title || ""));

      // Build navigation structure
      pages.forEach((page, index) => {
        const prev = index > 0 ? pages[index - 1] : null;
        const next = index < pages.length - 1 ? pages[index + 1] : null;

        const outputPath = path.join(pageOutputDir, sectionFolder);
        if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

        const html = pageTemplate
          .replace(/{{header}}/g, header)
          .replace(/{{footer}}/g, footer)
          .replace(/{{title}}/g, page.title || "")
          .replace(/{{body-id}}/g, page["body-id"] || "")
          .replace(/{{sections}}/g, (page.sections || []).map(section => {
            const imgBlock = section["html-image"] || "";
            const textBlock = section["html-text"] || "";
            return imgBlock + textBlock;
          }).join("\n"))
          
          .replace(/{{bottomNav}}/g, `
            <div id="prevnext">
              <ul class="piped">
                <li>${sectionData.title}</li>
                <li><a href="#top" class="scrollToTop"><span class="icon up"></span></a></li>
                ${prev ? `<li><a class="prev" href="/${sectionFolder}/${prev.slug}.html">${prev.title}</a></li>` : ""}
                ${next ? `<li><span class="next"><a href="/${sectionFolder}/${next.slug}.html">${next.title}</a></span></li>` : ""}
              </ul>
            </div>`);

        const outputFile = path.join(outputPath, `${page.slug}.html`);
        fs.writeFileSync(outputFile, html);
        console.log(`Generated page: ${outputFile}`);
      });
    }
  });
}

function buildPortfolioIndexes() {
  const categories = fs.readdirSync(contentDir);

  categories.forEach((category) => {
    const categoryPath = path.join(contentDir, category);
    const indexJsonPath = path.join(contentDir, category, "index.json");

    if (!fs.existsSync(indexJsonPath)) return;

    const indexData = JSON.parse(fs.readFileSync(indexJsonPath, "utf-8"));
    const files = fs.readdirSync(categoryPath).filter(file => file.endsWith(".json"));

    const thumbnails = files.map(file => {
      const data = JSON.parse(fs.readFileSync(path.join(categoryPath, file), "utf-8"));
      return `<div class="thumb">
        <a href="/portfolios/${category}/${data.slug}.html">
          <img src="/assets/photographs/thumbs/${data.thumb}" alt="${data.title}">
          <h4>${data.title}</h4>
        </a>
      </div>`;
    }).join("\n");

    const html = sectionTemplate
      .replace(/{{header}}/g, header)
      .replace(/{{footer}}/g, footer)
      .replace(/{{title}}/g, indexData.title || "")
      .replace(/{{intro}}/g, indexData.intro || "")
      .replace(/{{body-id}}/g, indexData["body-id"] || "")
      .replace(/{{thumbnails}}/g, thumbnails);

    const outputCategoryDir = path.join(outputDir, category);
    if (!fs.existsSync(outputCategoryDir)) fs.mkdirSync(outputCategoryDir, { recursive: true });

    const outputFile = path.join(outputCategoryDir, "index.html");
    fs.writeFileSync(outputFile, html);
    console.log(`Generated portfolio index: ${outputFile}`);
  });
}

buildImagePages();
buildSectionPages();
buildPortfolioIndexes();
