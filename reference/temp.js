{
  "title": "Cibachrome Legacy",
  "body-id": "Cibachrome",
  "navigation": {
    "section": "Cibachrome",
    "prev": null,
    "next": {
      "slug": "cibachrome/history",
      "label": "History"
    }
  },
  "sections": [
    {
      "html-image": "<figure class='center'><img src='/assets/images/cibachrome-01.jpg' alt='Print Process'></figure>",
      "html-text": "<h3>What Made Cibachrome Special</h3><p>Cibachrome was a unique color printing process known for...</p>"
    },
    {
      "html-text": "<h3>Legacy and Collectability</h3><p>Even after discontinuation, prints remain highly sought after...</p>"
    },
    {
      "html-image": "<figure class='center'><img src='/assets/images/cibachrome-02.jpg' alt='Glossy finish'></figure>"
    }
  ]
}


// Code for Build.js

const sectionHTML = (data.sections || []).map(section => {
  const imageBlock = section["html-image"] || "";
  const textBlock = section["html-text"] || "";

  return `
    <div class="section">
      ${imageBlock}
      ${textBlock}
    </div>
  `;
}).join("\n");
