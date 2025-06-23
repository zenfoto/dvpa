// build.js - Static site generator for DVPA

const fs = require("fs");
const path = require("path");

const contentDir = path.join(__dirname, "../content/portfolios");
const pageDir = path.join(__dirname, "../content/pages");
const outputDir = path.join(__dirname, "../public/portfolios");
const pageOutputDir = path.join(__dirname, "../public");
const photoTemplatePath = path.join(__dirname, "../templates/photograph.html");
const pageTemplatePath = path.join(__dirname, "../templates/page.html");

const photoTemplate = fs.readFileSync(photoTemplatePath, "utf-8");
const pageTemplate = fs.readFileSync(pageTemplatePath, "utf-8");

function buildImagePages() {
  const categories = fs.readdirSync(contentDir);

  categories.forEach((category) => {
    const categoryPath = path.join(contentDir, category);
    const files = fs.readdirSync(categoryPath);

    files.forEach((file) => {
      if (file.endsWith(".json")) {
        const data = JSON.parse(fs.readFileSync(path.join(categoryPath, file), "utf-8"));

        const html = photoTemplate
          .replace(/{{title}}/g, data.title || "")
          .replace(/{{image}}/g, data.image || "")
          .replace(/{{image-biz}}/g, data["image-biz"] || "")
          .replace(/{{image-home}}/g, data["image-home"] || "")
          .replace(/{{location}}/g, data.location || "")
          .replace(/{{place}}/g, data.place || "")
          .replace(/{{print-type}}/g, data["print-type"] || "")
          .replace(/{{edition-type}}/g, data["edition-type"] || "")
          .replace(/{{field-notes}}/g, data["field-notes"] || "")
          .replace(/{{date}}/g, data.date || "");

        const outputCategoryDir = path.join(outputDir, category);
        if (!fs.existsSync(outputCategoryDir)) fs.mkdirSync(outputCategoryDir, { recursive: true });

        const outputFile = path.join(outputCategoryDir, `${data.slug}.html`);
        fs.writeFileSync(outputFile, html);
        console.log(`Generated image page: ${outputFile}`);
      }
    });
  });
}

function buildSectionPages() {
  const files = fs.readdirSync(pageDir);

  files.forEach((file) => {
    if (file.endsWith(".json")) {
      const data = JSON.parse(fs.readFileSync(path.join(pageDir, file), "utf-8"));

      const html = pageTemplate
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

buildImagePages();
buildSectionPages();
