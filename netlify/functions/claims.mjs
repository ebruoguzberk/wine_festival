import { getStore } from "@netlify/blobs";

function getClaimsStore() {
  return getStore({ name: "wine-claims", consistency: "strong" });
}

export default async (req) => {
  const store = getClaimsStore();

  if (req.method === "GET") {
    const result = await store.get("claimed-concepts", { type: "json" });
    return new Response(JSON.stringify(result || {}), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "POST") {
    const { conceptTitle, pairName } = await req.json();

    if (!conceptTitle || !pairName) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Read current claims
    const current = (await store.get("claimed-concepts", { type: "json" })) || {};

    // Check if already claimed
    if (current[conceptTitle]) {
      return new Response(
        JSON.stringify({ error: "already_claimed", claimedBy: current[conceptTitle] }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Claim it
    current[conceptTitle] = pairName;
    await store.setJSON("claimed-concepts", current);

    return new Response(JSON.stringify({ success: true, claims: current }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = {
  path: "/api/claims",
};
