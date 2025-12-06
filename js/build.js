
const fs = require("fs");
const path = require("path");

const contentDir = path.join(__dirname, "../content/portfolios");
const pageDir = path.join(__dirname, "../content/pages");
const outputDir = path.join(__dirname, "../public/portfolios");
const pageOutputDir = path.join(__dirname, "../public");
const contentOutputDir = path.join(__dirname, "../public");

const photoTemplatePath = path.join(__dirname, "../templates/photograph.html");
const pageTemplatePath = path.join(__dirname, "../templates/page.html");
const contentTemplatePath = path.join(__dirname, "../templates/single.html");

const headerPath = path.join(__dirname, "../templates/header.html");
const footerPath = path.join(__dirname, "../templates/footer.html");

const photoTemplate = fs.readFileSync(photoTemplatePath, "utf-8");
const pageTemplate = fs.readFileSync(pageTemplatePath, "utf-8");
const contentTemplate = fs.readFileSync(contentTemplatePath, "utf-8");
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

function buildContentPages() {
  const baseDir = path.join(__dirname, "../content/pages");

  function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(filePath));
      } else if (file.endsWith(".json")) {
        results.push(filePath);
      }
    });
    return results;
  }

  const jsonFiles = walk(baseDir);

  jsonFiles.forEach((filePath) => {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const relativePath = path.relative(baseDir, filePath);
    const parts = relativePath.split(path.sep);
    const slug = path.basename(filePath, ".json");
    const outputPath = path.join(contentOutputDir, ...parts.slice(0, -1));

    let html = contentTemplate
      .replace(/{{header}}/g, header)
      .replace(/{{footer}}/g, footer)
      .replace(/{{title}}/g, data.title)
      .replace(/{{body-id}}/g, data["body-id"]);

    const sectionHTML = data.sections.map(section => `
<figure class="${section["figure-class"]}">
  <div class="${section["image-wrapper-class"]}">
    <img src="${section.image}" alt="${section.alt}" width="${section["image-width"]}" height="${section["image-height"]}" data-height="${section["data-height"]}" />
    <figcaption>${section.caption}</figcaption>
  </div>
</figure>
<h3>${section.heading}</h3>
<p>${section.text}</p>
    `).join("\n");

    html = html.replace("{{sections}}", sectionHTML);

    let navHTML = `
<div id="prevnext">
  <ul class="piped">
    <li>${data.navigation.section}</li>
    <li><a href="#top" class="scrollToTop"><span class="icon up"></span></a></li>`;

    if (data.navigation.prev) {
      navHTML += `<li><a class="prev" href="/${data.navigation.prev.slug}">${data.navigation.prev.label}</a></li>`;
    }
    if (data.navigation.next) {
      navHTML += `<li><span class="next"><a href="/${data.navigation.next.slug}">${data.navigation.next.label}</a></span></li>`;
    }

    navHTML += `
  </ul>
</div>`;

    html = html.replace("{{navigation}}", navHTML);

    const fileName = slug === "index" ? "index.html" : `${slug}.html`;
    if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });
    fs.writeFileSync(path.join(outputPath, fileName), html);
    console.log(`Generated content page: ${path.join(outputPath, fileName)}`);
  });
}

buildImagePages();
buildSectionPages();
buildContentPages();
