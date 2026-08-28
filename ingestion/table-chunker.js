const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

function normalizeHeading(line) {
  return line
    .replace(/^#{2,3}\s+/, '')
    .replace(/\s+#+\s*$/, '')
    .trim();
}

function isTableSeparator(line) {
  return /^[|\s:-]+$/.test(line.trim()) && line.includes('|');
}

function parseTableRow(line) {
  const cells = line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

  return cells;
}

function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  const step = chunkSize - overlap;

  for (let start = 0; start < text.length; start += step) {
    const chunk = text.slice(start, start + chunkSize);
    if (chunk) {
      chunks.push(chunk);
    }
    if (start + chunkSize >= text.length) {
      break;
    }
  }

  return chunks;
}

function parseDocument(markdownText, filename) {
  const lines = markdownText.split(/\r?\n/);
  const segments = [];
  let currentSection = filename;
  let buffer = [];

  function flushProseBuffer() {
    const content = buffer.join('\n').trim();
    buffer = [];
    if (content) {
      segments.push({
        type: 'prose',
        section: currentSection,
        content,
      });
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (/^##\s+/.test(trimmed) || /^###\s+/.test(trimmed)) {
      flushProseBuffer();
      currentSection = normalizeHeading(trimmed);
      continue;
    }

    const nextLine = lines[index + 1] ? lines[index + 1].trim() : '';
    const looksLikeTableStart = trimmed.startsWith('|') && isTableSeparator(nextLine);

    if (looksLikeTableStart) {
      flushProseBuffer();

      const tableLines = [line, lines[index + 1]];
      index += 2;

      while (index < lines.length) {
        const tableLine = lines[index];
        if (!tableLine.trim().startsWith('|')) {
          index -= 1;
          break;
        }
        tableLines.push(tableLine);
        index += 1;
      }

      const headers = parseTableRow(tableLines[0]);
      const rows = tableLines.slice(2).map((rowLine) => parseTableRow(rowLine));

      segments.push({
        type: 'table',
        section: currentSection,
        headers,
        rows,
        content: tableLines.join('\n'),
      });
      continue;
    }

    buffer.push(line);
  }

  flushProseBuffer();

  return segments;
}

function formatTableRow(section, headers, row) {
  const pairs = [];
  const limit = Math.min(headers.length, row.length);

  for (let index = 0; index < limit; index += 1) {
    const header = headers[index];
    const value = row[index];
    if (header && value) {
      pairs.push(`${header}: ${value}`);
    }
  }

  return `${section}: ${pairs.join(' | ')}`;
}

module.exports = {
  chunkText,
  formatTableRow,
  parseDocument,
};
