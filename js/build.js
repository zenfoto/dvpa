// build.js - Static site generator for DVPA with full support for photos, sections, and single content pages

const fs = require("fs");
const path = require("path");

// Paths
const contentDir = path.join(__dirname, "../content/portfolios");
const pageDir = path.join(__dirname, "../content/pages");
const outputDir = path.join(__dirname, "../public/portfolios");
const pageOutputDir = path.join(__dirname, "../public");

const photoTemplatePath = path.join(__dirname, "../templates/photograph.html");
const pageTemplatePath = path.join(__dirname, "../templates/page.html");
const sectionTemplatePath = path.join(__dirname, "../templates/single.html");

const headerPath = path.join(__dirname, "../templates/header.html");
const footerPath = path.join(__dirname, "../templates/footer.html");

// Templates
const photoTemplate = fs.readFileSync(photoTemplatePath, "utf-8");
const pageTemplate = fs.readFileSync(pageTemplatePath, "utf-8");
const sectionTemplate = fs.readFileSync(sectionTemplatePath, "utf-8");

const header = fs.readFileSync(headerPath, "utf-8");
const footer = fs.readFileSync(footerPath, "utf-8");

function buildImagePages() {
  const categories = fs.readdirSync(contentDir);

  categories.forEach((category) => {
    const categoryPath = path.join(contentDir, category);
    const files = fs.readdirSync(categoryPath).filter(file => file.endsWith(".json"));

    const dataObjects = files.map(file => {
      const filePath = path.join(categoryPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return { data, fileName: file };
    });

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
  const files = fs.readdirSync(pageDir);

  files.forEach((file) => {
    if (file.endsWith(".json")) {
      const data = JSON.parse(fs.readFileSync(path.join(pageDir, file), "utf-8"));

      const html = pageTemplate
        .replace(/{{header}}/g, header)
        .replace(/{{footer}}/g, footer)
        .replace(/{{title}}/g, data.title)
        .replace(/{{body}}/g, data.body);

      const sectionDir = path.join(pageOutputDir, data.slug);
      if (!fs.existsSync(sectionDir)) fs.mkdirSync(sectionDir, { recursive: true });

      const outputFile = path.join(sectionDir, "index.html");
      fs.writeFileSync(outputFile, html);
      console.log(`Generated section page: ${outputFile}`);
    }
  });
}

function buildSinglePages() {
  const singlesDir = path.join(pageDir, "about"); // You can expand this pattern as needed
  const files = fs.readdirSync(singlesDir).filter(file => file.endsWith(".json"));

  files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(singlesDir, file), "utf-8"));

    // Build each <section>
    const sectionHTML = (data.sections || []).map(section => {
      const hasFigure = section.image;
      const hasText = section.heading || section.text;
      const imgAttrs = [];

      if (section["image-width"]) imgAttrs.push(`width="${section["image-width"]}"`);
      if (section["image-height"]) imgAttrs.push(`height="${section["image-height"]}"`);
      if (section["data-height"]) imgAttrs.push(`data-height="${section["data-height"]}"`);

      let figureBlock = "";
      if (hasFigure) {
        figureBlock = `
          <figure class="center">
          <div styles="single-image">
          <img src="${section.image}" alt="${section.alt || ""}" ${imgAttrs.join(" ")}>
          </figure>
          <figcaption>${section.caption}</figcaption>
          </div>`;
      }

      let textBlock = "";
      if (hasText) {
        textBlock = `
          <div class="text">
            ${section.heading ? `<h3>${section.heading}</h3>` : ""}
            ${section.text ? `<p>${section.text}</p>` : ""}
          </div>`;
      }

      return `
        <div class="section">
          ${figureBlock}
          ${textBlock}
        </div>`;
    }).join("\n");

    const navHTML = `
      <div id="prevnext">
        <ul class="piped">
          <li>${data.navigation?.section || ""}</li>
          <li><a href="#top" class="scrollToTop"><span class="icon up"></span></a></li>
          ${data.navigation?.prev ? `<li><a class="prev" href="/${data.navigation.prev.slug}">${data.navigation.prev.label}</a></li>` : ""}
          ${data.navigation?.next ? `<li><span class="next"><a href="/${data.navigation.next.slug}">${data.navigation.next.label}</a></span></li>` : ""}
        </ul>
      </div>`;

    const html = sectionTemplate
      .replace(/{{header}}/g, header)
      .replace(/{{footer}}/g, footer)
      .replace(/{{title}}/g, data.title)
      .replace(/{{body-id}}/g, data["body-id"] || data.title)
      .replace(/{{sections}}/g, sectionHTML)
      .replace(/{{bottomNav}}/g, navHTML);

    const outputPath = path.join(pageOutputDir, "about"); // hardcoded path — adjust as needed
    if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

    const outputFile = path.join(outputPath, file.replace(".json", ".html"));
    fs.writeFileSync(outputFile, html);
    console.log(`Generated single content page: ${outputFile}`);
  });
}

buildImagePages();
buildSectionPages();
buildSinglePages();
