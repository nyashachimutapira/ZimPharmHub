const fs = require('fs');
const path = require('path');

function loadTemplate(name, locale = 'en', format = 'html') {
  const file = path.join(__dirname, locale, `${name}.${format}`);
  if (fs.existsSync(file)) {
    return fs.readFileSync(file, 'utf8');
  }
  // fallback to en
  const fallback = path.join(__dirname, 'en', `${name}.${format}`);
  if (fs.existsSync(fallback)) return fs.readFileSync(fallback, 'utf8');
  return null;
}

function renderTemplate(templateStr, vars = {}) {
  if (!templateStr) return '';
  return templateStr.replace(/{{\s*([\w\.]+)\s*}}/g, (_, key) => {
    return vars[key] !== undefined && vars[key] !== null ? vars[key] : '';
  });
}

// helper to load html AND text fallback if available
function loadTemplatePair(name, locale = 'en') {
  const html = loadTemplate(name, locale, 'html');
  let text = loadTemplate(name, locale, 'txt');
  if (!text) {
    // try text fallback in en
    text = loadTemplate(name, 'en', 'txt');
  }
  return { html, text };
}

module.exports = { loadTemplate, renderTemplate };