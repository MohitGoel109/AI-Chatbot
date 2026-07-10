/**
 * Minimal markdown renderer covering what chat replies actually use:
 * **bold**, *italic*, `inline code`, ```code blocks```, bullet/numbered
 * lists, and line breaks. Deliberately not a full markdown engine — just
 * enough to make replies readable instead of showing raw asterisks.
 */
function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={key} className="inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function Markdown({ text }) {
  if (!text) return null;

  const blocks = text.split(/\n{2,}/);

  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim() !== "");

        // Fenced code block
        if (block.trim().startsWith("```")) {
          const code = block.replace(/```[a-z]*\n?/g, "").replace(/```$/, "");
          return (
            <pre className="code-block" key={bi}>
              <code>{code}</code>
            </pre>
          );
        }

        // Bullet list
        if (lines.every((l) => /^[-*]\s+/.test(l.trim())) && lines.length > 0) {
          return (
            <ul key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.trim().replace(/^[-*]\s+/, ""), `${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }

        // Numbered list
        if (lines.every((l) => /^\d+\.\s+/.test(l.trim())) && lines.length > 0) {
          return (
            <ol key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.trim().replace(/^\d+\.\s+/, ""), `${bi}-${li}`)}</li>
              ))}
            </ol>
          );
        }

        // Plain paragraph (line breaks preserved)
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <span key={li}>
                {renderInline(l, `${bi}-${li}`)}
                {li < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

export default Markdown;
