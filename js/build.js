// -------------------------------------------------------------
// Load modules first
// -------------------------------------------------------------
const fs = require("fs");
const path = require("path");
const parse = require("csv-parse/sync").parse;

// -------------------------------------------------------------
// Define all directory paths BEFORE any functions use them
// -------------------------------------------------------------
const contentDir = path.join(__dirname, "../content/portfolios");
const pageDir = path.join(__dirname, "../content/pages");
const outputDir = path.join(__dirname, "../public/portfolios");
const pageOutputDir = path.join(__dirname, "../public");

const photoTemplatePath = path.join(__dirname, "../templates/photograph.html");
const pageTemplatePath = path.join(__dirname, "../templates/single.html");
const sectionTemplatePath = path.join(__dirname, "../templates/section.html");
const homeTemplatePath = path.join(__dirname, "../templates/home.html");
const headerPath = path.join(__dirname, "../templates/header.html");
const footerPath = path.join(__dirname, "../templates/footer.html");

// Load templates
const photoTemplate = fs.readFileSync(photoTemplatePath, "utf-8");
const pageTemplate = fs.readFileSync(pageTemplatePath, "utf-8");
const sectionTemplate = fs.readFileSync(sectionTemplatePath, "utf-8");
const homeTemplate = fs.readFileSync(homeTemplatePath, "utf-8");
const header = fs.readFileSync(headerPath, "utf-8");
const footer = fs.readFileSync(footerPath, "utf-8");

// -------------------------------------------------------------
// convertCSVtoJSON
// -------------------------------------------------------------
function convertCSVtoJSON() {
  const csvPath = path.join(contentDir, "master.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("❌ master.csv not found:", csvPath);
    return;
  }

 let rawCSV = fs.readFileSync(csvPath, "utf-8");

  // Remove BOM (Byte-Order Mark)
  rawCSV = rawCSV.replace(/^\uFEFF/, "");
  
  const records = parse(rawCSV, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const seen = new Set();

  records.forEach(row => {
    const slug = row.slug;
    const portfolio = row.portfolio;
    if (!slug || !portfolio) return;

    const outputDir = path.join(contentDir, portfolio);
    const outputFile = path.join(outputDir, `${slug}.json`);

    seen.add(`${portfolio}/${slug}.json`);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(row, null, 2));
  });

  // -------------------------------------------------------------
  // SAFETY CHECK — abort cleanup if nothing was generated
  // -------------------------------------------------------------
  if (seen.size === 0) {
    console.error("❌ No JSON generated — aborting cleanup.");
    return;
  }

  // -------------------------------------------------------------
  // Cleanup of obsolete JSON files
  // -------------------------------------------------------------
  const portfolios = fs.readdirSync(contentDir);

  portfolios.forEach(portfolio => {
    const folder = path.join(contentDir, portfolio);

    // Skip master.csv or any non-folder
    if (!fs.statSync(folder).isDirectory()) return;

    const files = fs
      .readdirSync(folder)
      .filter(f => f.endsWith(".json") && f !== "index.json");

    files.forEach(file => {
      const relativePath = `${portfolio}/${file}`;
      if (!seen.has(relativePath)) {
        fs.unlinkSync(path.join(folder, file));
        console.log(`🗑️ Deleted obsolete JSON: ${relativePath}`);
      }
    });
  });
}

// -------------------------------------------------------------
// buildHomeFeaturedJSON
// -------------------------------------------------------------
function buildHomeFeaturedJSON() {
  const outputPath = path.join(
    __dirname,
    "../public/global/data/home-featured.json"
  );

  const featured = [];

  const portfolios = fs.readdirSync(contentDir);

  portfolios.forEach(portfolio => {
    const folder = path.join(contentDir, portfolio);

    if (!fs.statSync(folder).isDirectory()) return;

    const files = fs
      .readdirSync(folder)
      .filter(f => f.endsWith(".json") && f !== "index.json");

    files.forEach(file => {
      const data = JSON.parse(
        fs.readFileSync(path.join(folder, file), "utf-8")
      );

      if (data.homepage !== "Y") return;

      featured.push({
        title: data.title,
        image: data.image,
        slug: data.slug,
        place: data.place,
        location: data.location,
        portfolio: data.portfolio,
        pname: data.pname
      });
    });
  });

  if (featured.length === 0) {
    console.warn("⚠️ No homepage items found (homepage=Y).");
    return;
  }

  // Optional but recommended: deterministic ordering
  featured.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(featured, null, 2));

  console.log(`🏠 Generated home-featured.json (${featured.length} items)`);
}


// -------------------------------------------------------------
// buildHomePage
// -------------------------------------------------------------

function buildHomePage() {
  const featuredPath = path.join(
    __dirname,
    "../public/global/data/home-featured.json"
  );

  if (!fs.existsSync(featuredPath)) {
    console.error("❌ home-featured.json not found");
    return;
  }

  const featured = JSON.parse(fs.readFileSync(featuredPath, "utf-8"));

  if (!featured.length) {
    console.warn("⚠️ No featured homepage items.");
    return;
  }

  // 🔹 Build ALL hero items (hidden by default)
  const heroHTML = featured.map(f => `
    <div class="hero-item">
      <a href="/portfolios/${f.portfolio}/${f.slug}.html">
        <img src="/assets/photographs/${f.image}" alt="${f.title}">
      </a>
      <h3>${f.title}</h3>
      <h4>${f.location}, ${f.place}</h4>
      <p class="collection">
        Part of the <a href="/portfolios/${f.portfolio}/">${f.pname}</a> collection.
      </p>
      <p><a href="/portfolios" class="more">View All Photographs »</a></p>
    </div>
  `).join("\n");

  const html = homeTemplate
    .replace(/{{header}}/g, header)
    .replace(/{{footer}}/g, footer)
    .replace(/{{featured-hero}}/g, heroHTML);

  fs.writeFileSync(path.join(pageOutputDir, "index.html"), html);
  console.log(`🏠 Generated home page (${featured.length} hero items)`);
}


// -------------------------------------------------------------
// buildImagePages
// -------------------------------------------------------------
function buildImagePages() {
  const categories = fs.readdirSync(contentDir);

  categories.forEach(category => {
    const categoryPath = path.join(contentDir, category);

    // Skip master.csv or anything not a directory
    if (!fs.statSync(categoryPath).isDirectory()) return;

    const files = fs
      .readdirSync(categoryPath)
      .filter(file => file.endsWith(".json") && file !== "index.json");

    const dataObjects = files.map(file => {
      const filePath = path.join(categoryPath, file);
      return { data: JSON.parse(fs.readFileSync(filePath, "utf-8")), fileName: file };
    });

    // Sort by order field
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
        .replace(/{{width}}/g, data.width)
        .replace(/{{height}}/g, data.height)
        .replace(/{{location}}/g, data.location)
        .replace(/{{place}}/g, data.place)
        .replace(/{{state}}/g, data.state)
        .replace(/{{year}}/g, data.year)
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

// -------------------------------------------------------------
// buildSectionPages
// -------------------------------------------------------------
function buildSectionPages() {
  const files = fs.readdirSync(pageDir, { withFileTypes: true });

  files.forEach(file => {
    if (!file.isDirectory()) return;

    const sectionFolder = file.name;
    const sectionPath = path.join(pageDir, sectionFolder);
    const sectionIndexPath = path.join(sectionPath, "index.json");

    if (!fs.existsSync(sectionIndexPath)) return;

    const sectionData = JSON.parse(fs.readFileSync(sectionIndexPath, "utf-8"));
    const allFiles = fs.readdirSync(sectionPath).filter(f => f.endsWith(".json") && f !== "index.json");

    const pages = allFiles.map(file => {
      const pageData = JSON.parse(fs.readFileSync(path.join(sectionPath, file), "utf-8"));
      return { ...pageData, fileName: file };
    }).sort((a, b) => (a.title || "").localeCompare(b.title || ""));

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
        .replace(/{{sections}}/g, (page.sections || []).map(section =>
          (section["html-image"] || "") + (section["html-text"] || "")
        ).join("\n"))
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
  });
}

// -------------------------------------------------------------
// buildPortfolioIndexes
// -------------------------------------------------------------
function buildPortfolioIndexes() {
  const categories = fs.readdirSync(contentDir);

  categories.forEach(category => {
    const categoryPath = path.join(contentDir, category);
    const indexJsonPath = path.join(categoryPath, "index.json");

    if (!fs.existsSync(indexJsonPath)) return;

    const indexData = JSON.parse(fs.readFileSync(indexJsonPath, "utf-8"));

    const files = fs
      .readdirSync(categoryPath)
      .filter(f => f.endsWith(".json") && f !== "index.json");

    const dataObjects = files.map(file => {
      const data = JSON.parse(fs.readFileSync(path.join(categoryPath, file), "utf-8"));
      return data;
    });

    // Sort by order field (same as image page nav)
    dataObjects.sort((a, b) => a.order - b.order);

    const thumbnails = dataObjects.map(data => `
      <div class="thumb">
        <a href="/portfolios/${category}/${data.slug}.html">
          <img src="/assets/photographs/thumbs/${data.thumb}" alt="${data.title}">
          <h4>${data.title}</h4>
        </a>
      </div>
    `).join("\n");


    const html = sectionTemplate
      .replace(/{{header}}/g, header)
      .replace(/{{footer}}/g, footer)
      .replace(/{{title}}/g, indexData.title || "")
      .replace(/{{intro}}/g, indexData.intro || "")
      .replace(/{{body-id}}/g, indexData["body-id"] || "")
      .replace(/{{thumbnails}}/g, thumbnails);

    const outputCategoryDir = path.join(outputDir, category);
    if (!fs.existsSync(outputCategoryDir)) fs.mkdirSync(outputCategoryDir, { recursive: true });

    fs.writeFileSync(path.join(outputCategoryDir, "index.html"), html);
    console.log(`Generated portfolio index: ${path.join(outputCategoryDir, "index.html")}`);
  });
}

// -------------------------------------------------------------
// buildPortfoliosIndex
// -------------------------------------------------------------
function buildPortfoliosIndex() {
  const portfolios = fs.readdirSync(contentDir);

  const cards = [];

  portfolios.forEach(portfolio => {
    const folder = path.join(contentDir, portfolio);

    if (!fs.statSync(folder).isDirectory()) return;

    const indexJsonPath = path.join(folder, "index.json");
    if (!fs.existsSync(indexJsonPath)) return;

    const indexData = JSON.parse(fs.readFileSync(indexJsonPath, "utf-8"));

    // Load image JSON files (exclude index.json)
    const imageFiles = fs
      .readdirSync(folder)
      .filter(f => f.endsWith(".json") && f !== "index.json");

    if (!imageFiles.length) return;

    const images = imageFiles.map(file =>
      JSON.parse(fs.readFileSync(path.join(folder, file), "utf-8"))
    );

    // Sort images by order and take the first
    images.sort((a, b) => a.order - b.order);
    const leadImage = images[0];

    cards.push({
      portfolio,
      title: indexData.title || portfolio,
      thumb: leadImage.thumb,
      order: indexData.order
    });
  });

  if (!cards.length) {
    console.warn("⚠️ No portfolios found for portfolios index.");
    return;
  }

  // Option A: alphabetical by portfolio title
  cards.sort((a, b) => {
  // Portfolios with an explicit order come first
  if (a.order != null && b.order != null) return a.order - b.order;
  if (a.order != null) return -1;
  if (b.order != null) return 1;

  // Fallback: alphabetical
  return a.title.localeCompare(b.title);
});


  const thumbnails = cards.map(card => `
    <div class="thumb">
      <a href="/portfolios/${card.portfolio}/">
        <img src="/assets/photographs/thumbs/${card.thumb}" alt="${card.title}">
        <h4>${card.title}</h4>
      </a>
    </div>
  `).join("\n");

  const html = sectionTemplate
    .replace(/{{header}}/g, header)
    .replace(/{{footer}}/g, footer)
    .replace(/{{title}}/g, "Portfolios")
    .replace(/{{intro}}/g, "")
    .replace(/{{body-id}}/g, "portfolios")
    .replace(/{{thumbnails}}/g, thumbnails);

  const outputDirPath = path.join(outputDir);
  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
  }

  fs.writeFileSync(path.join(outputDirPath, "index.html"), html);
  console.log("📁 Generated portfolios index");
}


// -------------------------------------------------------------
// Run everything
// -------------------------------------------------------------

convertCSVtoJSON();
buildHomeFeaturedJSON();
buildHomePage(); 
buildImagePages();
buildSectionPages();
buildPortfoliosIndex();
buildPortfolioIndexes();

