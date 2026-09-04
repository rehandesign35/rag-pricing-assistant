function extractCitationSources(responseText) {
  return Array.from(
    new Set(
      [...String(responseText || '').matchAll(/\[source:\s*([^\]]+?)\s*\]/gi)].map((match) =>
        match[1].trim(),
      ),
    ),
  );
}

function citationMatchesExpected(responseText, expectedDocs) {
  const citedSources = extractCitationSources(responseText);
  return citedSources.some((source) => expectedDocs.includes(source));
}

module.exports = { extractCitationSources, citationMatchesExpected };