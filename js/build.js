const fs = require("fs");
const path = require("path");

// Directory paths
const contentDir = path.join(__dirname, "../content/portfolios");
const pageDir = path.join(__dirname, "../content/pages");
const outputDir = path.join(__dirname, "../public/portfolios");
const pageOutputDir = path.join(__dirname, "../public");

// Template paths
const photoTemplatePath = path.join(__dirname, "../templates/photograph.html");
const pageTemplatePath = path.join(__dirname, "../templates/page.html");
const singleTemplatePath = path.join(__dirname, "../templates/single.html");
const headerPath = path.join(__dirname, "../templates/header.html");
const footerPath = path.join(__dirname, "../templates/footer.html");

// Load templates
const photoTemplate = fs.readFileSync(photoTemplatePath, "utf-8");
const pageTemplate = fs.readFileSync(pageTemplatePath, "utf-8");
const singleTemplate = fs.readFileSync(singleTemplatePath, "utf-8");
const header = fs.readFileSync(headerPath, "utf-8");
const footer = fs.readFileSync(footerPath, "utf-8");

// Build individual photograph pages
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

    // Sort by 'order' for navigation
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

// Build simple single-body section pages (like About, Writings, etc.)
function buildSectionPages() {
  const files = fs.readdirSync(pageDir).filter(f => f.endsWith(".json"));

  files.forEach((file) => {
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
  });
}

// Build structured multi-section pages (e.g. about/history)
function buildStructuredPages() {
  const sectionFolders = fs.readdirSync(pageDir).filter((f) => {
    const fullPath = path.join(pageDir, f);
    return fs.statSync(fullPath).isDirectory();
  });

  sectionFolders.forEach(folder => {
    const folderPath = path.join(pageDir, folder);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".json"));

    const pages = files.map(file => {
      const data = JSON.parse(fs.readFileSync(path.join(folderPath, file), "utf-8"));
      return { data, file };
    }).sort((a, b) => (a.data.order || 0) - (b.data.order || 0));

    pages.forEach((entry, index) => {
      const { data } = entry;
      const prev = index > 0 ? pages[index - 1].data : null;
      const next = index < pages.length - 1 ? pages[index + 1].data : null;

      // Build body sections
      const sectionsHTML = (data.sections || []).map(section => {
        const figure = section.image ? `
          <figure class="${section.class || ""}">
            <img src="${section.image}" alt="${section.alt || ""}" ${section.height ? `data-height="${section.height}"` : ""}>
          </figure>` : "";

        const heading = section.heading ? `<h3>${section.heading}</h3>` : "";
        const paragraph = section.text ? `<p>${section.text}</p>` : "";

        return `
        <div class="${section.divClass || "section"}">
          ${figure}
          ${heading}
          ${paragraph}
        </div>`;
      }).join("\n");

      // Build bottom navigation
      const bottomNav = `
      <div id="prevnext">
        <ul class="piped">
          <li>${data.section || ""}</li>
          <li><a href="#top" class="scrollToTop"><span class="icon up"></span></a></li>
          ${prev ? `<li><a class="prev" href="/${folder}/${prev.slug}.html">${prev.title}</a></li>` : ""}
          ${next ? `<li><span class="next"><a href="/${folder}/${next.slug}.html">${next.title}</a></span></li>` : ""}
        </ul>
      </div>`;

      const html = singleTemplate
        .replace(/{{header}}/g, header)
        .replace(/{{footer}}/g, footer)
        .replace(/{{title}}/g, data.title)
        .replace(/{{sections}}/g, sectionsHTML)
        .replace(/{{bottomNav}}/g, bottomNav);

      const sectionDir = path.join(pageOutputDir, folder);
      if (!fs.existsSync(sectionDir)) fs.mkdirSync(sectionDir, { recursive: true });

      const outputFile = path.join(sectionDir, `${data.slug}.html`);
      fs.writeFileSync(outputFile, html);
      console.log(`Generated structured page: ${outputFile}`);
    });
  });
}

// Run all builders
buildImagePages();
buildSectionPages();
buildStructuredPages();
