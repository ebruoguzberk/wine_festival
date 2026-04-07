import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore({ name: "wine-claims", consistency: "strong" });
  const claims = (await store.get("claimed-concepts", { type: "json" })) || {};

  const entries = Object.entries(claims);

  const html = `<!DOCTYPE html>
<html><head><title>Wine Festival - Claims Admin</title>
<style>
  body { font-family: system-ui; background: #0a0a12; color: #e8e0d4; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { color: #D4AF37; font-size: 24px; }
  .count { color: #a89a80; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; color: #D4AF37; font-size: 12px; letter-spacing: 2px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
  td { padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .concept { color: #f5efe0; font-style: italic; }
  .pair { color: #a89a80; }
  .empty { color: #555; text-align: center; padding: 40px; }
</style></head><body>
  <h1>Wine Festival Claims</h1>
  <div class="count">${entries.length} of 36 concepts claimed</div>
  ${entries.length === 0 ? '<div class="empty">No claims yet</div>' : `
  <table>
    <tr><th>CONCEPT</th><th>CLAIMED BY</th></tr>
    ${entries.map(([concept, pair]) => `<tr><td class="concept">${concept}</td><td class="pair">${pair}</td></tr>`).join('')}
  </table>`}
</body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html" } });
};

export const config = { path: "/admin/claims" };
