// src/utils/contentPasteNormalizer.ts

/**
 * Symbol font to Unicode mapping (Adobe/Microsoft standard Symbol font encoding)
 */
export const SYMBOL_TO_UNICODE: Record<number, string> = {
  0x22: '∀', // for all
  0x23: '#', // number sign / congruent
  0x24: '∃', // there exists
  0x25: '%',
  0x26: '&',
  0x27: '∋', // contains as member
  0x28: '(',
  0x29: ')',
  0x2A: '∗', // asterisk operator
  0x2B: '+',
  0x2C: ',',
  0x2D: '−', // minus sign
  0x2E: '.',
  0x2F: '/',
  0x30: '0', 0x31: '1', 0x32: '2', 0x33: '3', 0x34: '4', 0x35: '5', 0x36: '6', 0x37: '7', 0x38: '8', 0x39: '9',
  0x3A: ':', 0x3B: ';', 0x3C: '<', 0x3D: '=', 0x3E: '>', 0x3F: '?',
  0x40: '≅', // approximately equal to
  0x41: 'Α', 0x42: 'Β', 0x43: 'Χ', 0x44: 'Δ', 0x45: 'Ε', 0x46: 'Φ', 0x47: 'Γ',
  0x48: 'Η', 0x49: 'Ι', 0x4A: 'ϑ', 0x4B: 'Κ', 0x4C: 'Λ', 0x4D: 'Μ', 0x4E: 'Ν',
  0x4F: 'Ο', 0x50: 'Π', 0x51: 'Θ', 0x52: 'Ρ', 0x53: 'Σ', 0x54: 'Τ', 0x55: 'Υ',
  0x56: 'ς', 0x57: 'Ω', 0x58: 'Ξ', 0x59: 'Ψ', 0x5A: 'Ζ',
  0x5B: '[', 0x5C: '∴', 0x5D: ']', 0x5E: '⊥', 0x5F: '_',
  0x60: '‾',
  0x61: 'α', 0x62: 'β', 0x63: 'χ', 0x64: 'δ', 0x65: 'ε', 0x66: 'φ', 0x67: 'γ',
  0x68: 'η', 0x69: 'ι', 0x6A: 'ϕ', 0x6B: 'κ', 0x6C: 'λ', 0x6D: 'μ', 0x6E: 'ν',
  0x6F: 'ο', 0x70: 'π', 0x71: 'θ', 0x72: 'ρ', 0x73: 'σ', 0x74: 'τ', 0x75: 'υ',
  0x76: 'ϖ', 0x77: 'ω', 0x78: 'ξ', 0x79: 'ψ', 0x7A: 'ζ',
  0x7B: '{', 0x7C: '|', 0x7D: '}', 0x7E: '∼',
  0xA0: '€', 0xA1: 'ϒ', 0xA2: '′', 0xA3: '≤', 0xA4: '⁄', 0xA5: '∞', 0xA6: 'ƒ',
  0xA7: '♣', 0xA8: '♦', 0xA9: '♥', 0xAA: '♠', 0xAB: '↔', 0xAC: '←', 0xAD: '↑',
  0xAE: '→', 0xAF: '↓', 0xB0: '°', 0xB1: '±', 0xB2: '″', 0xB3: '≥', 0xB4: '×',
  0xB5: '∝', 0xB6: '∂', 0xB7: '•', 0xB8: '÷', 0xB9: '≠', 0xBA: '≡', 0xBB: '≈',
  0xBC: '…', 0xC0: 'ℵ', 0xC1: 'ℑ', 0xC2: 'ℜ', 0xC3: '℘', 0xC4: '⊗', 0xC5: '⊕',
  0xC6: '∅', 0xC7: '∩', 0xC8: '∪', 0xC9: '⊃', 0xCA: '⊇', 0xCB: '⊄', 0xCC: '⊂',
  0xCD: '⊆', 0xCE: '∈', 0xCF: '∉', 0xD0: '∠', 0xD1: '∇', 0xD2: '®', 0xD3: '©',
  0xD4: '™', 0xD5: '∏', 0xD6: '√', 0xD7: '⋅', 0xD8: '¬', 0xD9: '∧', 0xDA: '∨',
  0xDB: '⇔', 0xDC: '⇐', 0xDD: '⇑', 0xDE: '⇒', 0xDF: '⇓', 0xE0: '◊', 0xE1: '〈',
  0xE5: '∑', 0xF1: '〉', 0xF2: '∫', 0xF3: '⌠', 0xF5: '⌡'
};

/**
 * Common LaTeX math commands mapped to Unicode literal characters
 */
const LATEX_MAP: Record<string, string> = {
  '\\pm': '±', '\\mp': '∓', '\\times': '×', '\\div': '÷', '\\cdot': '·',
  '\\neq': '≠', '\\ne': '≠', '\\leq': '≤', '\\le': '≤', '\\geq': '≥', '\\ge': '≥',
  '\\approx': '≈', '\\equiv': '≡', '\\sim': '∼', '\\propto': '∝', '\\infty': '∞',
  '\\partial': '∂', '\\nabla': '∇', '\\forall': '∀', '\\exists': '∃',
  '\\in': '∈', '\\notin': '∉', '\\subset': '⊂', '\\subseteq': '⊆',
  '\\cap': '∩', '\\cup': '∪', '\\emptyset': '∅', '\\angle': '∠', '\\perp': '⊥',
  '\\circ': '°', '\\degree': '°', '\\sum': '∑', '\\prod': '∏', '\\int': '∫',
  '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\epsilon': 'ε',
  '\\varepsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ', '\\vartheta': 'θ',
  '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ', '\\mu': 'μ', '\\nu': 'ν',
  '\\xi': 'ξ', '\\pi': 'π', '\\varpi': 'ϖ', '\\rho': 'ρ', '\\varrho': 'ρ',
  '\\sigma': 'σ', '\\varsigma': 'ς', '\\tau': 'τ', '\\upsilon': 'υ',
  '\\phi': 'φ', '\\varphi': 'φ', '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',
  '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Theta': 'Θ', '\\Lambda': 'Λ', '\\Xi': 'Ξ',
  '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Upsilon': 'Υ', '\\Phi': 'Φ', '\\Psi': 'Ψ', '\\Omega': 'Ω'
};

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ'
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ', 'i': 'ᵢ', 'j': 'ⱼ'
};

/**
 * Converts Windows Private Use Area (PUA) characters (\uF020 to \uF0FF) to standard Unicode symbols
 */
export function convertPuaCharacters(str: string): string {
  if (!str) return '';
  return str.replace(/[\uF020-\uF0FF]/g, (ch) => {
    const code = ch.charCodeAt(0) & 0xFF;
    return SYMBOL_TO_UNICODE[code] || ch;
  });
}

/**
 * Translates a string where text was styled with the Symbol font
 */
export function convertSymbolString(text: string): string {
  if (!text) return '';
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xF020 && code <= 0xF0FF) {
      out += SYMBOL_TO_UNICODE[code & 0xFF] || text[i];
    } else if (code === 0x24) {
      out += '∃';
    } else if (
      SYMBOL_TO_UNICODE[code] &&
      code !== 0x23 &&
      code !== 0x25 &&
      code !== 0x26 &&
      code !== 0x28 &&
      code !== 0x29 &&
      code !== 0x2B &&
      code !== 0x2C &&
      code !== 0x2E &&
      code !== 0x2F &&
      !(code >= 0x30 && code <= 0x39) &&
      code !== 0x3A && code !== 0x3B && code !== 0x3C && code !== 0x3D && code !== 0x3E && code !== 0x3F &&
      code !== 0x5B && code !== 0x5D && code !== 0x5F &&
      code !== 0x7B && code !== 0x7C && code !== 0x7D
    ) {
      out += SYMBOL_TO_UNICODE[code];
    } else {
      out += text[i];
    }
  }
  return out;
}

/**
 * Extracts balanced curly braces starting at startIdx
 */
function extractBalanced(str: string, startIdx: number): { content: string; endIdx: number } | null {
  if (str[startIdx] !== '{') return null;
  let depth = 0;
  for (let i = startIdx; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) return { content: str.slice(startIdx + 1, i), endIdx: i };
    }
  }
  return null;
}

/**
 * Replaces nested or single \frac{num}{den} with (num)/(den)
 */
function replaceFractions(str: string): string {
  let res = str;
  let idx = res.indexOf('\\frac');
  let iterations = 0;
  while (idx !== -1 && iterations < 20) {
    iterations++;
    let cursor = idx + 5;
    while (cursor < res.length && /\s/.test(res[cursor])) cursor++;
    const num = extractBalanced(res, cursor);
    if (!num) break;
    cursor = num.endIdx + 1;
    while (cursor < res.length && /\s/.test(res[cursor])) cursor++;
    const den = extractBalanced(res, cursor);
    if (!den) break;
    const numClean = replaceFractions(num.content);
    const denClean = replaceFractions(den.content);
    res = res.slice(0, idx) + '(' + numClean + ')/(' + denClean + ')' + res.slice(den.endIdx + 1);
    idx = res.indexOf('\\frac');
  }
  return res;
}

/**
 * Replaces \sqrt{x} with √(x)
 */
function replaceSqrt(str: string): string {
  let res = str;
  let idx = res.indexOf('\\sqrt');
  let iterations = 0;
  while (idx !== -1 && iterations < 20) {
    iterations++;
    let cursor = idx + 5;
    while (cursor < res.length && /\s/.test(res[cursor])) cursor++;
    const inner = extractBalanced(res, cursor);
    if (!inner) {
      if (cursor < res.length && /[a-zA-Z0-9]/.test(res[cursor])) {
        res = res.slice(0, idx) + '√' + res[cursor] + res.slice(cursor + 1);
        idx = res.indexOf('\\sqrt');
        continue;
      }
      break;
    }
    const innerClean = replaceSqrt(inner.content);
    res = res.slice(0, idx) + '√(' + innerClean + ')' + res.slice(inner.endIdx + 1);
    idx = res.indexOf('\\sqrt');
  }
  return res;
}

/**
 * Normalizes a text string containing math formulas or special characters into literal characters
 */
export function cleanFormulaText(input: string): string {
  if (!input) return '';
  let str = convertPuaCharacters(input);

  // Unwrap display math $$...$$
  str = str.replace(/\$\$([\s\S]+?)\$\$/g, '$1');

  // Unwrap LaTeX bracket delimiters \(...\) and \[...\]
  str = str.replace(/\\\(([\s\S]*?)\\\)/g, '$1');
  str = str.replace(/\\\[([\s\S]*?)\\\]/g, '$1');

  // Unwrap inline math $...$ when containing math elements or variables (avoiding currency like $50)
  str = str.replace(/\$([^\$\n\r]+?)\$/g, (match, inner) => {
    if (/^\s*\d+(\.\d{2})?\s*$/.test(inner)) {
      return match;
    }
    if (/[=\\^_+\-*\/±≤≥≠≈√πθα-ω]/.test(inner)) {
      return inner;
    }
    if (/^[a-zA-Z](\([a-zA-Z0-9, ]+\))?$/.test(inner.trim())) {
      return inner.trim();
    }
    return match;
  });

  // Fractions & Square roots
  str = replaceFractions(str);
  str = replaceSqrt(str);

  // LaTeX symbol replacements
  for (const [pattern, repl] of Object.entries(LATEX_MAP)) {
    const regex = new RegExp(pattern.replace('\\', '\\\\') + '(?![a-zA-Z])', 'g');
    str = str.replace(regex, repl);
  }

  // Superscripts: ^{2} or ^2 -> ²
  str = str.replace(/\^\{([0-9+\-nix]+)\}/g, (_, m) => m.split('').map((c: string) => SUPERSCRIPT_MAP[c] || c).join(''));
  str = str.replace(/\^([0-9+\-nix])/g, (_, m) => SUPERSCRIPT_MAP[m] || m);

  // Subscripts: _{1} or _1 -> ₁
  str = str.replace(/_\{([0-9+\-aeoxij]+)\}/g, (_, m) => m.split('').map((c: string) => SUBSCRIPT_MAP[c] || c).join(''));
  str = str.replace(/_([0-9+\-aeoxij])/g, (_, m) => SUBSCRIPT_MAP[m] || m);

  // Parentheses cleanup: \left( \right) -> ( )
  str = str.replace(/\\left\s*([(\[{|])/g, '$1').replace(/\\right\s*([)\]}|])/g, '$1');
  str = str.replace(/\\left\./g, '').replace(/\\right\./g, '');

  // Escaped symbols: \$ -> $, \# -> #, \& -> &, \% -> %, \_ -> _
  str = str.replace(/\\([$#&%_{}])/g, '$1');

  return str;
}

/**
 * Converts MathML element recursively into clean literal formula text
 */
function convertMathMLElement(node: Element): string {
  const tagName = node.tagName.toLowerCase().replace(/^.*:/, '');

  if (tagName === 'mfrac') {
    const children = Array.from(node.children);
    const num = children[0] ? convertMathMLElement(children[0]) : '';
    const den = children[1] ? convertMathMLElement(children[1]) : '';
    return `(${num})/(${den})`;
  }

  if (tagName === 'msqrt') {
    const inner = Array.from(node.childNodes).map((child) => convertMathMLNode(child)).join('');
    return `√(${inner})`;
  }

  if (tagName === 'mroot') {
    const children = Array.from(node.children);
    const base = children[0] ? convertMathMLElement(children[0]) : '';
    const index = children[1] ? convertMathMLElement(children[1]) : '';
    return `${index}√(${base})`;
  }

  if (tagName === 'msup') {
    const children = Array.from(node.children);
    const base = children[0] ? convertMathMLElement(children[0]) : '';
    const sup = children[1] ? convertMathMLElement(children[1]) : '';
    const supConverted = sup.split('').map((c) => SUPERSCRIPT_MAP[c] || c).join('');
    return `${base}${supConverted}`;
  }

  if (tagName === 'msub') {
    const children = Array.from(node.children);
    const base = children[0] ? convertMathMLElement(children[0]) : '';
    const sub = children[1] ? convertMathMLElement(children[1]) : '';
    const subConverted = sub.split('').map((c) => SUBSCRIPT_MAP[c] || c).join('');
    return `${base}${subConverted}`;
  }

  if (tagName === 'msubsup') {
    const children = Array.from(node.children);
    const base = children[0] ? convertMathMLElement(children[0]) : '';
    const sub = children[1] ? convertMathMLElement(children[1]) : '';
    const sup = children[2] ? convertMathMLElement(children[2]) : '';
    const subConverted = sub.split('').map((c) => SUBSCRIPT_MAP[c] || c).join('');
    const supConverted = sup.split('').map((c) => SUPERSCRIPT_MAP[c] || c).join('');
    return `${base}${subConverted}${supConverted}`;
  }

  return Array.from(node.childNodes).map((child) => convertMathMLNode(child)).join('');
}

function convertMathMLNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return convertPuaCharacters(node.textContent || '');
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    return convertMathMLElement(node as Element);
  }
  return '';
}

/**
 * Parses and normalizes HTML while preserving formatting (bold, italic, underline,
 * headings, lists, tables, paragraphs, superscripts, subscripts, images, spacing, and capitalization)
 * while translating Symbol fonts, PUA characters, MathML, and formulas into literal text.
 */
export function normalizeHtmlContent(html: string): { html: string; text: string; hasImages: boolean } {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    const cleaned = cleanFormulaText(html);
    return { html: cleaned, text: cleaned, hasImages: /<img\b/i.test(html) };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 1. Remove dangerous or non-content elements
  const removeSelectors = ['script', 'xml', 'meta', 'link', 'style', 'annotation', '.katex-mathml'];
  for (const selector of removeSelectors) {
    doc.querySelectorAll(selector).forEach((el) => el.remove());
  }

  // 2. Unwrap Google Docs wrapper: <b style="font-weight:normal" id="docs-internal-guid-...">
  doc.querySelectorAll('b[id^="docs-internal-guid-"]').forEach((bEl) => {
    const parent = bEl.parentNode;
    if (parent) {
      while (bEl.firstChild) {
        parent.insertBefore(bEl.firstChild, bEl);
      }
      bEl.remove();
    }
  });

  // 3. Process MathML blocks (<math>) into readable text nodes
  doc.querySelectorAll('math').forEach((mathEl) => {
    const literalMath = convertMathMLElement(mathEl);
    const textNode = doc.createTextNode(literalMath);
    mathEl.replaceWith(textNode);
  });

  // 4. Process Word Mso Headings (<p class="MsoHeading1"> -> <h1>)
  doc.querySelectorAll('p').forEach((pEl) => {
    const className = pEl.className || '';
    if (/MsoHeading1/i.test(className)) {
      const h1 = doc.createElement('h1');
      while (pEl.firstChild) h1.appendChild(pEl.firstChild);
      pEl.replaceWith(h1);
    } else if (/MsoHeading2/i.test(className)) {
      const h2 = doc.createElement('h2');
      while (pEl.firstChild) h2.appendChild(pEl.firstChild);
      pEl.replaceWith(h2);
    } else if (/MsoHeading3/i.test(className)) {
      const h3 = doc.createElement('h3');
      while (pEl.firstChild) h3.appendChild(pEl.firstChild);
      pEl.replaceWith(h3);
    }
  });

  // 5. Ensure tables have borders for clear visibility
  doc.querySelectorAll('table').forEach((tableEl) => {
    if (!tableEl.hasAttribute('border')) {
      tableEl.setAttribute('border', '1');
    }
  });

  // 6. Process Symbol / Wingdings fonts
  const allElements = Array.from(doc.querySelectorAll('*'));
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const styleAttr = htmlEl.getAttribute('style') || '';
    const faceAttr = htmlEl.getAttribute('face') || '';

    const isSymbolFont =
      /font-family\s*:\s*[^;]*(Symbol|MT Symbol|Wingdings)/i.test(styleAttr) ||
      /Symbol|MT Symbol|Wingdings/i.test(faceAttr);

    if (isSymbolFont) {
      el.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE && child.textContent) {
          child.textContent = convertSymbolString(child.textContent);
        }
      });
      htmlEl.style.fontFamily = '';
      if (htmlEl.hasAttribute('face')) {
        htmlEl.removeAttribute('face');
      }
    }
  });

  // 7. Convert styled spans to semantic tags (support bold, italic, underline, strike, super, sub simultaneously)
  doc.querySelectorAll('span').forEach((spanEl) => {
    const styleAttr = spanEl.getAttribute('style') || '';

    const isBold = /font-weight\s*:\s*(bold|[7-9]00)/i.test(styleAttr);
    const isItalic = /font-style\s*:\s*italic/i.test(styleAttr);
    const isUnderline = /text-decoration\s*:[^;]*underline/i.test(styleAttr);
    const isStrike = /text-decoration\s*:[^;]*line-through/i.test(styleAttr);
    const isSuper = /vertical-align\s*:\s*super/i.test(styleAttr);
    const isSub = /vertical-align\s*:\s*sub/i.test(styleAttr);

    if (isBold || isItalic || isUnderline || isStrike || isSuper || isSub) {
      let wrapper: HTMLElement = doc.createElement('span');
      while (spanEl.firstChild) {
        wrapper.appendChild(spanEl.firstChild);
      }
      if (isSub) {
        const sub = doc.createElement('sub');
        sub.appendChild(wrapper);
        wrapper = sub;
      }
      if (isSuper) {
        const sup = doc.createElement('sup');
        sup.appendChild(wrapper);
        wrapper = sup;
      }
      if (isStrike) {
        const s = doc.createElement('s');
        s.appendChild(wrapper);
        wrapper = s;
      }
      if (isUnderline) {
        const u = doc.createElement('u');
        u.appendChild(wrapper);
        wrapper = u;
      }
      if (isItalic) {
        const em = doc.createElement('em');
        em.appendChild(wrapper);
        wrapper = em;
      }
      if (isBold) {
        const strong = doc.createElement('strong');
        strong.appendChild(wrapper);
        wrapper = strong;
      }
      spanEl.replaceWith(wrapper);
    }
  });

  // 8. Clean MS Word attributes and dangerous handlers
  doc.querySelectorAll('*').forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (htmlEl.className && /Mso/i.test(htmlEl.className)) {
      htmlEl.removeAttribute('class');
    }
    for (let i = htmlEl.attributes.length - 1; i >= 0; i--) {
      const attr = htmlEl.attributes[i];
      if (/^on/i.test(attr.name) || /javascript\s*:/i.test(attr.value)) {
        htmlEl.removeAttribute(attr.name);
      }
    }
    if (htmlEl.hasAttribute('style')) {
      let css = htmlEl.getAttribute('style') || '';
      css = css
        .replace(/mso-[^;]+;?/gi, '')
        .replace(/font-family\s*:\s*[^;]+;?/gi, '')
        .replace(/line-height\s*:\s*[^;]+;?/gi, '')
        .trim();
      if (css) {
        htmlEl.setAttribute('style', css);
      } else {
        htmlEl.removeAttribute('style');
      }
    }
  });

  // 9. Process all text nodes for PUA characters and LaTeX formulas
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  let currentNode = walker.nextNode();
  while (currentNode) {
    if (currentNode.textContent) {
      currentNode.textContent = cleanFormulaText(currentNode.textContent);
    }
    currentNode = walker.nextNode();
  }

  const hasImages = doc.querySelectorAll('img').length > 0;
  const resultHtml = doc.body.innerHTML
    .replace(/<font\b[^>]*>/gi, '')
    .replace(/<\/font>/gi, '')
    .replace(/<o:p>[\s\S]*?<\/o:p>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');


  return {
    html: resultHtml,
    text: doc.body.innerText || doc.body.textContent || '',
    hasImages
  };
}

/**
 * Main entry point for normalizing clipboard paste data in the Lesson Content editor,
 * preserving formatting, spacing, and capitalization while converting formulas and special characters.
 */
export function normalizePastedContent(clipboardData: DataTransfer): {
  html: string;
  text: string;
  isHtml: boolean;
} {
  const html = clipboardData.getData('text/html');
  const plainText = clipboardData.getData('text/plain');

  // If HTML exists and has content
  if (html && html.trim().length > 0) {
    const normalized = normalizeHtmlContent(html);
    if (normalized.html && normalized.html.trim().length > 0) {
      return {
        html: normalized.html,
        text: normalized.text,
        isHtml: true
      };
    }
  }

  // Plain text paste:
  // Convert formulas and PUA characters, preserve capitalization, spacing, and line breaks!
  const cleanedText = cleanFormulaText(plainText || '');

  // Escape HTML entities to prevent injection, and convert newlines to <br>
  const escapedHtml = cleanedText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r\n|\r|\n/g, '<br>');

  return {
    html: escapedHtml,
    text: cleanedText,
    isHtml: false
  };
}
