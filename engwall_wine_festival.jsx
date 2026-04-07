import { useState } from "react";

const mainTabs = ["The Event", "Wine Tasting", "Games", "Dress Code", "The Art"];
const tabIcons = { "The Event": "✦", "Wine Tasting": "🍷", "Games": "🎲", "Dress Code": "👑", "The Art": "🎨" };

const concepts = {
  Romantic: [
    { title: "The Sultan's Secret Garden", desc: "Something lush, floral, hidden beauty, intoxicating — the kind of wine that makes you close your eyes." },
    { title: "Silk and Smoke", desc: "Something smooth, hazy, sensual, lingering — it stays on your lips long after the last sip." },
    { title: "A Letter Never Sent", desc: "Something restrained, longing, words left unspoken — delicate with an ache underneath." },
    { title: "The Dancer's Veil", desc: "Something that reveals itself slowly, layer by layer, never fully exposing its secrets." },
    { title: "The Rose That Grew Through Stone", desc: "Something tender and beautiful that survived something hard — delicate on the surface, unbreakable underneath." },
    { title: "The Last Dance Before Dawn", desc: "Something urgent, warm, bittersweet — you know the night is ending but you're not ready to let go." },
  ],
  Mysterious: [
    { title: "Stolen Jewels at Midnight", desc: "Something dark, bold, dangerous — you shouldn't be drinking this, but you can't stop." },
    { title: "The Merchant's Last Sunset", desc: "Something warm, golden, bittersweet — the end of a long journey, savored slowly." },
    { title: "Moonlight on the Bosphorus", desc: "Something cool, reflective, shimmering — elegant silence on dark water." },
    { title: "An Empty Throne", desc: "Something powerful, heavy, commanding — with a haunting sense of absence." },
    { title: "The Perfumer's Workshop", desc: "Something layered with invisible complexity — you keep finding new things every time you return to it." },
    { title: "The Voice Behind the Curtain", desc: "Something you can't see, can't name, but can't ignore — it commands the room without ever showing itself." },
  ],
  Adventurous: [
    { title: "The Map to Nowhere", desc: "Something unconventional, a beautiful detour — you have no idea where this is going but you trust it." },
    { title: "The Thief Who Loved a Princess", desc: "Something unexpected, charming, a little rough around the edges but absolutely irresistible." },
    { title: "Fire in the Desert", desc: "Something fierce, dry, burning, unapologetic — it doesn't care if you're ready." },
    { title: "The Spice Merchant's Daughter", desc: "Something complex, aromatic, unforgettable — every sip is a different city." },
    { title: "The Silk Road at Full Gallop", desc: "Something bold, fast, rich — every sip covers a thousand miles and you never want to stop riding." },
    { title: "The Wrong Train to Marrakech", desc: "Something you didn't choose but turned out to be the best accident of your life." },
  ],
  Funny: [
    { title: "My Mother-in-Law's Curse", desc: "Something that hits you harder than expected and absolutely refuses to leave." },
    { title: "The Sultan's Diet Starts Monday", desc: "Something indulgent, guilty, the wine equivalent of 'I deserve this.'" },
    { title: "The Camel That Refused to Walk", desc: "Something stubborn, earthy, does things entirely on its own terms." },
    { title: "The Belly Dancer's Grocery List", desc: "Something unexpectedly mundane hiding behind something glamorous — all that sparkle and underneath it's just... eggs and bread." },
    { title: "Aladdin's Third Wish (He Wasted the First Two)", desc: "Something you'd pick if you only had one chance left and you're NOT messing it up this time." },
    { title: "The Genie's Day Off", desc: "Something loud, unfiltered, no rules — the bottle equivalent of 'I don't work here today.'" },
  ],
  Absurd: [
    { title: "Lost in the Bazaar With No Phone", desc: "Something overwhelming, disorienting — you have no idea what's happening but you're having the time of your life." },
    { title: "The Flying Carpet With Turbulence", desc: "Something that starts smooth and then does something completely unexpected halfway through." },
    { title: "The Fortune Teller Who Was Wrong About Everything", desc: "Something that defies every single expectation you had when you read the label." },
    { title: "A Sword Fight Over Hummus", desc: "Something aggressive and bold over something that should be simple and peaceful." },
    { title: "The Snake Charmer Whose Snake Fell Asleep", desc: "Something that was supposed to be intense and dramatic but turned out hilariously mellow." },
    { title: "The Parrot That Learned the Wrong Language", desc: "Something that communicates with total confidence but nothing it says makes any sense — and somehow that's the charm." },
  ],
  Poetic: [
    { title: "The First Rain After Summer", desc: "Something fresh, surprising, a relief — like breathing again after holding it too long." },
    { title: "What the Sand Remembers", desc: "Something ancient, quiet, patient — it has been here longer than you and it will outlast you." },
    { title: "The Color of a Word You Can't Translate", desc: "Something that makes you feel something you don't have a name for." },
    { title: "Between Two Heartbeats", desc: "Something that exists in the pause — not the beginning, not the end, just the suspended middle." },
    { title: "A Garden That Grows at Night", desc: "Something that blooms in darkness, more alive when no one is watching." },
    { title: "The Last Page of a Book You Loved", desc: "Something bittersweet and perfect — you don't want it to end but you know it must." },
  ],
};

const wineColors = {
  Romantic: { accent: "#e8446a", glow: "rgba(232,68,106,0.15)" },
  Mysterious: { accent: "#6ba3d6", glow: "rgba(107,163,214,0.15)" },
  Adventurous: { accent: "#e8a832", glow: "rgba(232,168,50,0.15)" },
  Funny: { accent: "#a8d44a", glow: "rgba(168,212,74,0.15)" },
  Absurd: { accent: "#d46ae8", glow: "rgba(212,106,232,0.15)" },
  Poetic: { accent: "#4ad4b0", glow: "rgba(74,212,176,0.15)" },
};
const wineEmojis = { Romantic: "♥", Mysterious: "☽", Adventurous: "⚔", Funny: "☻", Absurd: "✦", Poetic: "❋" };

const gold = "#D4AF37";
const S = { card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "24px", marginBottom: "16px" } };

function Divider({ color = gold }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "20px 0", opacity: 0.3 }}><div style={{ width: "60px", height: "1px", background: color }} /><div style={{ fontSize: "8px", color }}>◆</div><div style={{ width: "60px", height: "1px", background: color }} /></div>;
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: "30px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "400", color: "#f0e8dc", textAlign: "center", letterSpacing: "2px", margin: "0 0 6px", fontFamily: "'Playfair Display', 'Georgia', serif" }}>{title}</h3>
      {subtitle && <p style={{ fontSize: "11px", color: "#5a5448", textAlign: "center", fontStyle: "italic", marginBottom: "16px" }}>{subtitle}</p>}
      <Divider />
      {children}
    </div>
  );
}

// ==== TAB: THE EVENT ====
function TheEventTab() {
  return (
    <div style={{ padding: "0 20px 40px", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "30px 0 0" }}>
        <div style={{ fontSize: "10px", letterSpacing: "5px", color: gold, opacity: 0.5, marginBottom: "16px" }}>YOU ARE INVITED TO THE</div>
        <h1 style={{ fontSize: "clamp(30px, 6vw, 48px)", fontWeight: "400", color: "#f0e8dc", margin: "0 0 4px", lineHeight: 1.15, fontFamily: "'Playfair Display', 'Georgia', serif" }}>3rd Annual</h1>
        <h1 style={{ fontSize: "clamp(28px, 5.5vw, 44px)", fontWeight: "400", color: gold, margin: "0 0 10px", letterSpacing: "3px", lineHeight: 1.15, fontFamily: "'Playfair Display', 'Georgia', serif" }}>Engwall Wine Festival</h1>
        <Divider />
        <div style={{ fontSize: "20px", color: "#c4b8a8", fontStyle: "italic", marginBottom: "6px", fontFamily: "'Playfair Display', 'Georgia', serif" }}>"The Thousand & One Night"</div>
        <div style={{ fontSize: "13px", color: "#6a6058", letterSpacing: "3px", marginBottom: "8px" }}>WINE · ART · LEGEND</div>
        <p style={{ fontSize: "13px", color: "#7a6e60", fontStyle: "italic", maxWidth: "420px", margin: "0 auto 30px" }}>An Arabian Nights afternoon in the garden. Come dressed like royalty, taste wine through stories, and build something unforgettable with your hands.</p>
      </div>

      {/* The Story */}
      <div style={S.card}>
        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: 0 }}>
          This year's theme is <span style={{ color: gold }}>The Thousand & One Night</span> — an Arabian Nights afternoon in the garden. Think Aladdin, Jasmine, magic carpets, gold everything. You'll taste wine through stories you perform, build a collaborative work of art with your hands, and eat a Middle Eastern feast like a sultan who doesn't believe in moderation.
        </p>
      </div>

      {/* Details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        {[
          { label: "WHEN", value: "June 20th", sub: "12:00 PM arrival · 1:00 PM wine tasting starts" },
          { label: "WHERE", value: "Engwall Backyard", sub: "" },
          { label: "FOOD", value: "Middle Eastern Feast", sub: "Provided — mezze, börek, baklava, hummus, dates, pomegranates, and more" },
          { label: "WHAT YOU BRING", value: "2 bottles of the same wine with your teammate", sub: "Random object from your home and your bazaar pitch · Best attitude and appetite" },
        ].map((item) => (
          <div key={item.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "18px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "3px", color: gold, marginBottom: "6px", opacity: 0.6 }}>{item.label}</div>
            <div style={{ fontSize: "15px", color: "#d4c8b8", marginBottom: "4px" }}>{item.value}</div>
            <div style={{ fontSize: "11px", color: "#6a6058", lineHeight: 1.5 }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* What to expect */}
      <div style={S.card}>
        <h3 style={{ fontSize: "16px", color: "#d4c8b8", margin: "0 0 18px", fontWeight: "400" }}>What to Expect</h3>
        {[
          { icon: "🍷", title: "A Wine Tasting Game", text: "Each pair picks a secret concept, finds a wine that embodies it, and presents it to the group — through a skit, a song, a poem, a dance, or whatever they dream up. The audience has to guess the concept. It's part performance, part mystery, part competition." },
          { icon: "🎨", title: "A Collaborative Art Piece", text: "All 30 of us will build one massive artwork together out of thousands of pieces. Each person gets a numbered section. When they all click together, a hidden image reveals itself. You've never done anything like this." },
          { icon: "🍽", title: "A Middle Eastern Feast", text: "Hummus, baba ganoush, börek, stuffed grape leaves, flatbread, baklava, Turkish delight, dates stuffed with pistachios, pomegranate seeds, and more. All provided. You just bring your appetite." },
          { icon: "🎲", title: "Games & Trivia", text: "The Bazaar Pitch, trivia, and more — see the Games tab for everything you need to know." },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "14px", marginBottom: "18px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "22px", flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: "14px", color: "#c4b8a8", marginBottom: "4px" }}>{item.title}</div>
              <p style={{ fontSize: "13px", color: "#7a6e60", margin: 0, lineHeight: 1.7 }}>{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <p style={{ fontSize: "14px", color: "#5a5448", fontStyle: "italic", lineHeight: 1.7 }}>
          Shoes come off at the door. Wine goes in your hand.
          <br />The rest will reveal itself.
        </p>
      </div>
    </div>
  );
}

// ==== TAB: WINE TASTING ====
function WineTastingTab() {
  const [activeCat, setActiveCat] = useState("Romantic");
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [claimedConcepts, setClaimedConcepts] = useState({});
  const [pairName, setPairName] = useState("");
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [justClaimed, setJustClaimed] = useState(null);
  const wc = wineColors[activeCat];
  const cats = Object.keys(concepts);

  // Load claimed concepts from shared storage
  const loadClaimed = async () => {
    try {
      const result = await window.storage.get("claimed-concepts", true);
      if (result && result.value) {
        setClaimedConcepts(JSON.parse(result.value));
      }
    } catch (e) {
      // Key doesn't exist yet, that's fine
    }
    setLoading(false);
  };

  useState(() => { loadClaimed(); });

  const handleClaim = async () => {
    if (!pairName.trim() || !selected) return;
    setSubmitting(true);
    try {
      // Reload latest to avoid conflicts
      let current = {};
      try {
        const result = await window.storage.get("claimed-concepts", true);
        if (result && result.value) current = JSON.parse(result.value);
      } catch (e) {}

      if (current[selected]) {
        alert("Someone just claimed this concept! Please pick another.");
        setClaimedConcepts(current);
        setSubmitting(false);
        return;
      }

      current[selected] = pairName.trim();
      await window.storage.set("claimed-concepts", JSON.stringify(current), true);
      setClaimedConcepts(current);
      setJustClaimed(selected);
      setShowClaimForm(false);
      setPairName("");
      setTimeout(() => setJustClaimed(null), 4000);
    } catch (e) {
      alert("Something went wrong. Try again!");
    }
    setSubmitting(false);
  };

  const isClaimed = (title) => !!claimedConcepts[title];
  const claimedBy = (title) => claimedConcepts[title] || null;
  const totalClaimed = Object.keys(claimedConcepts).length;

  return (
    <div style={{ padding: "0 20px 40px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "20px 0 0" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "400", color: "#f0e8dc", margin: "0 0 8px", letterSpacing: "2px", fontFamily: "'Playfair Display', 'Georgia', serif" }}>Choose Your Story</h2>
        <p style={{ fontSize: "14px", color: "#7a6e60", fontStyle: "italic", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>Pick a concept. Find a wine that embodies it. Present it to the court without revealing your concept. Let them guess your tale.</p>
      </div>

      {/* Claimed counter */}
      {totalClaimed > 0 && (
        <div style={{ textAlign: "center", padding: "12px 0 0" }}>
          <span style={{ fontSize: "12px", color: gold, opacity: 0.6, letterSpacing: "2px" }}>{totalClaimed} / 36 CONCEPTS CLAIMED</span>
        </div>
      )}

      <Divider color={wc.accent} />

      {/* Category pills */}
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px", marginBottom: "24px" }}>
        {cats.map((cat) => {
          const active = activeCat === cat;
          const tc = wineColors[cat];
          const catClaimed = concepts[cat].filter(c => isClaimed(c.title)).length;
          return <button key={cat} onClick={() => { setActiveCat(cat); setSelected(null); setShowClaimForm(false); }} style={{ padding: "10px 18px", border: active ? `1px solid ${tc.accent}` : "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", background: active ? tc.glow : "rgba(255,255,255,0.03)", color: active ? tc.accent : "#6a6058", cursor: "pointer", fontSize: "13px", letterSpacing: "1px", transition: "all 0.3s ease", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}><span>{wineEmojis[cat]}</span>{cat}{catClaimed > 0 && <span style={{ fontSize: "10px", opacity: 0.5 }}>({6 - catClaimed} left)</span>}</button>;
        })}
      </div>

      {/* Just claimed confirmation */}
      {justClaimed && (
        <div style={{ background: "rgba(74,212,176,0.1)", border: "1px solid rgba(74,212,176,0.3)", borderRadius: "12px", padding: "16px", marginBottom: "20px", textAlign: "center" }}>
          <span style={{ fontSize: "14px", color: "#4ad4b0" }}>✓ You claimed "{justClaimed}" — it's yours! Now go find your wine.</span>
        </div>
      )}

      {/* Concept cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px", marginBottom: "36px" }}>
        {concepts[activeCat].map((c, i) => {
          const claimed = isClaimed(c.title);
          const isSel = selected === c.title && !claimed;
          const isHov = hovered === c.title && !claimed;
          return (
            <div key={c.title}
              onMouseEnter={() => !claimed && setHovered(c.title)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => { if (!claimed) { setSelected(isSel ? null : c.title); setShowClaimForm(false); } }}
              style={{
                background: claimed ? "rgba(255,255,255,0.01)" : isSel ? `linear-gradient(135deg, rgba(255,255,255,0.08), ${wc.glow})` : isHov ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                border: claimed ? "1px solid rgba(255,255,255,0.03)" : isSel ? `1px solid ${wc.accent}` : "1px solid rgba(255,255,255,0.06)",
                borderRadius: "12px", padding: "22px",
                cursor: claimed ? "default" : "pointer",
                transition: "all 0.4s ease",
                transform: isSel ? "scale(1.02)" : isHov ? "translateY(-2px)" : "none",
                position: "relative",
                opacity: claimed ? 0.4 : 1,
              }}>
              <div style={{ position: "absolute", top: "16px", right: "16px", fontSize: "11px", color: claimed ? "rgba(255,255,255,0.1)" : isSel ? wc.accent : "rgba(255,255,255,0.1)", fontFamily: "monospace" }}>{claimed ? "✓" : String(i + 1).padStart(2, "0")}</div>
              <h3 style={{ fontSize: "16px", fontWeight: "400", color: claimed ? "#555" : isSel ? wc.accent : "#d4c8b8", margin: "0 0 10px", fontStyle: "italic", paddingRight: "28px", transition: "color 0.3s ease", lineHeight: 1.3, textDecoration: claimed ? "line-through" : "none" }}>"{c.title}"</h3>
              <p style={{ fontSize: "13px", color: claimed ? "#444" : "#8a7e70", margin: 0, lineHeight: 1.6 }}>{claimed ? `Claimed by ${claimedBy(c.title)}` : c.desc}</p>

              {isSel && !claimed && (
                <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  {!showClaimForm ? (
                    <button onClick={(e) => { e.stopPropagation(); setShowClaimForm(true); }} style={{ padding: "10px 20px", border: `1px solid ${wc.accent}`, borderRadius: "20px", background: wc.glow, color: wc.accent, cursor: "pointer", fontSize: "12px", letterSpacing: "1px", fontFamily: "inherit", width: "100%" }}>
                      CLAIM THIS CONCEPT
                    </button>
                  ) : (
                    <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input
                        type="text"
                        placeholder="Your names (e.g. Sarah & Mike)"
                        value={pairName}
                        onChange={(e) => setPairName(e.target.value)}
                        style={{ padding: "10px 14px", border: `1px solid rgba(255,255,255,0.15)`, borderRadius: "8px", background: "rgba(255,255,255,0.05)", color: "#f0e8dc", fontSize: "14px", fontFamily: "inherit", outline: "none" }}
                      />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={handleClaim} disabled={!pairName.trim() || submitting} style={{ flex: 1, padding: "10px", border: `1px solid ${wc.accent}`, borderRadius: "8px", background: pairName.trim() ? wc.accent : "transparent", color: pairName.trim() ? "#0a0a0f" : "#555", cursor: pairName.trim() ? "pointer" : "default", fontSize: "12px", letterSpacing: "1px", fontFamily: "inherit", fontWeight: "600" }}>
                          {submitting ? "CLAIMING..." : "CONFIRM"}
                        </button>
                        <button onClick={() => setShowClaimForm(false)} style={{ padding: "10px 16px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", background: "transparent", color: "#6a6058", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}>
                          CANCEL
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* HOW IT WORKS */}
      <Section title="How It Works">
        {[
          { s: "01", t: "Choose Your Concept", d: "Browse the categories above. Pick the one that speaks to you. Claim it — first come, first served. No two pairs can have the same concept." },
          { s: "02", t: "Find a Partner", d: "Pair up with someone — your partner, a friend, a stranger you want to conspire with. You're a duo now. You'll present together." },
          { s: "03", t: "Find Your Wine — Two Bottles", d: "Go to a wine shop together and find a wine that embodies your concept. Buy two identical bottles — one for presenting, one for pouring. It doesn't matter if it's a $12 bottle or a $50 bottle — what matters is why you chose it." },
          { s: "04", t: "Optional: Bring Supporting Elements", d: "If you want to go the extra mile, you can bring anything that helps tell your story — a food pairing, a prop, a scent, a sound, a fabric. Totally optional, but the pairs who engage more senses tend to be the ones nobody forgets." },
          { s: "05", t: "Keep Your Concept Secret", d: "Do NOT tell anyone what concept you picked. This is the game. When you present, the audience has to guess which concept you are. Your job is to make them feel it without saying it." },
          { s: "06", t: "Prepare Your Presentation", d: "Plan how you'll bring your concept to life — a performance, a poem, an outfit, a skit, a game, anything. The only rule: you never say your concept out loud. The audience must figure it out." },
        ].map((item) => (
          <div key={item.s} style={{ display: "flex", gap: "16px", marginBottom: "20px", alignItems: "flex-start" }}>
            <div style={{ fontSize: "11px", color: gold, fontFamily: "monospace", opacity: 0.5, paddingTop: "3px", flexShrink: 0 }}>{item.s}</div>
            <div>
              <div style={{ fontSize: "15px", color: "#d4c8b8", marginBottom: "4px" }}>{item.t}</div>
              <div style={{ fontSize: "13px", color: "#7a6e60", lineHeight: 1.7 }}>{item.d}</div>
            </div>
          </div>
        ))}
      </Section>

      {/* PRESENT HOWEVER YOU WANT */}
      <Section title="Present However You Want" subtitle="There are no rules. Go minimal or go all out. Here are some ideas:">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px", marginBottom: "10px" }}>
          {[
            { icon: "🎭", title: "Perform a skit", desc: "Act out your concept as a scene — be the thief, the sultan, the merchant. Let the audience piece it together." },
            { icon: "🎤", title: "Sing a song", desc: "Sing something (badly is fine) that captures the mood. The song IS your clue." },
            { icon: "💃", title: "Dance it out", desc: "A choreographed moment, a slow dramatic pour, a tango with the bottle. No words needed." },
            { icon: "📜", title: "Read a poem", desc: "Write a short poem that hints at your concept without naming it. Let them feel their way to the answer." },
            { icon: "🎬", title: "Show a slideshow", desc: "Three slides. Just images that capture the feeling. The audience connects the dots." },
            { icon: "👗", title: "Let your outfit speak", desc: "Dress as your concept. Say nothing. Just pour the wine and watch them guess." },
            { icon: "🎲", title: "Invent a game", desc: "Make the group play a 2-minute game that embodies your concept before they're allowed to taste." },
            { icon: "🕵️", title: "Give them three clues", desc: "Say three words. Just three. Then pour. Let the room erupt with guesses." },
            { icon: "🧆", title: "Pair it with a bite", desc: "Bring a small food that embodies your concept. One taste, one sip — the combination IS the clue." },
            { icon: "🪄", title: "Build a tiny world", desc: "A scent, a fabric, a prop, a sound on your phone — create a 30-second atmosphere before you pour." },
          ].map((idea) => (
            <div key={idea.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "16px" }}>
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>{idea.icon}</div>
              <div style={{ fontSize: "13px", color: "#c4b8a8", marginBottom: "4px", fontWeight: "600" }}>{idea.title}</div>
              <div style={{ fontSize: "11px", color: "#6a6058", lineHeight: 1.5 }}>{idea.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* THE RULES */}
      <Section title="The Rules">
        {[
          "Wraps will be provided at the party — bring your two bottles unwrapped, they'll be covered when you arrive.",
          "When it's your turn, DO NOT announce your concept. Your presentation IS the clue. The audience has to figure it out.",
          "Present however you want — sing, dance, perform a skit, read a poem, show slides, let your outfit do the talking, or invent something nobody's thought of.",
          "After your presentation, the audience guesses which concept you are. Let them debate. Let them argue. Then reveal the answer.",
          "Unwrap the bottle and pour for everyone. The group tastes your wine knowing the story behind it.",
          "No judgment on the wine itself — a bold $10 bottle with a perfect story beats a boring $50 bottle every time.",
        ].map((rule, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "14px", alignItems: "flex-start" }}>
            <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: `1px solid ${gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: gold, flexShrink: 0, opacity: 0.6 }}>{i + 1}</div>
            <p style={{ fontSize: "13px", color: "#8a7e70", margin: 0, lineHeight: 1.7 }}>{rule}</p>
          </div>
        ))}
      </Section>

      {/* WHO WINS */}
      <Section title="Who Wins the Crown" subtitle="After all pairs have presented, everyone votes. You cannot vote for yourselves.">
        <div style={{ display: "grid", gap: "12px" }}>
          {[
            { crown: "👑", title: "The Sultan's Crown", sub: "Best Overall Pairing", desc: "The pair whose wine, presentation, and concept came together most perfectly. The audience felt it before they even guessed it.", color: "#D4AF37" },
            { crown: "🎭", title: "The Scheherazade", sub: "Best Performance", desc: "The pair who put on the most unforgettable presentation — the ones who made the room gasp, laugh, or go silent.", color: "#e8446a" },
            { crown: "🔮", title: "The Oracle", sub: "Best Guesser", desc: "The person in the audience who correctly guessed the most concepts. The one who reads people, wine, and stories better than anyone.", color: "#d46ae8" },
            { crown: "🍷", title: "The Sommelier's Nod", sub: "Best Wine Discovery", desc: "The pair who brought a wine nobody knew but everyone wanted a second glass of. The hidden gem of the afternoon.", color: "#6ba3d6" },
          ].map((a) => (
            <div key={a.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "30px", marginBottom: "8px" }}>{a.crown}</div>
              <div style={{ fontSize: "16px", color: a.color, fontStyle: "italic", marginBottom: "2px" }}>{a.title}</div>
              <div style={{ fontSize: "10px", color: "#5a5448", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>{a.sub}</div>
              <p style={{ fontSize: "12px", color: "#7a6e60", margin: 0, lineHeight: 1.6, maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>{a.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "12px", color: "#4a4438", textAlign: "center", marginTop: "20px", fontStyle: "italic", lineHeight: 1.7 }}>
          Winners are announced at the end of the afternoon.<br />
          The Sultan's Crown holders take home a special bottle.<br />
          The Oracle gets bragging rights for life.<br />
          <span style={{ color: gold, opacity: 0.4 }}>Everyone else gets the memory.</span>
        </p>
      </Section>
    </div>
  );
}

// ==== TAB: DRESS CODE ====
function DressCodeTab() {
  return (
    <div style={{ padding: "0 20px 40px", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "400", color: "#f0e8dc", margin: "0 0 8px", letterSpacing: "2px", fontFamily: "'Playfair Display', 'Georgia', serif" }}>What to Wear</h2>
        <p style={{ fontSize: "14px", color: "#7a6e60", fontStyle: "italic", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>The theme is Arabian Nights — dress up as much or as little as you want. Here are some ideas to get you started.</p>
      </div>
      <Divider />

      <div style={S.card}>
        <h3 style={{ fontSize: "16px", color: "#d4c8b8", margin: "0 0 14px", fontWeight: "400" }}>The Vibe</h3>
        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: 0 }}>
          Think gold, jewel tones, flowing fabrics. You can go full costume if that's your thing, or just pull something from your closet in the right colors with some gold jewelry. However far you want to take it is the right amount.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
        <div style={S.card}>
          <h4 style={{ fontSize: "12px", color: gold, letterSpacing: "3px", margin: "0 0 14px", fontWeight: "400" }}>IDEAS FOR HER</h4>
          {[
            "A flowing maxi dress or kaftan",
            "Silk wrap or draped scarf",
            "Harem pants with a crop top",
            "Layered gold necklaces and big earrings",
            "A head scarf draped loosely",
            "Anything in emerald, cobalt, burgundy, or gold",
            "Sandals or go barefoot",
          ].map((item, i) => <p key={i} style={{ fontSize: "13px", color: "#8a7e70", margin: "0 0 8px", lineHeight: 1.5 }}>{item}</p>)}
        </div>
        <div style={S.card}>
          <h4 style={{ fontSize: "12px", color: gold, letterSpacing: "3px", margin: "0 0 14px", fontWeight: "400" }}>IDEAS FOR HIM</h4>
          {[
            "A linen shirt — white, black, or jewel toned",
            "Loose trousers or wide-leg pants",
            "A light scarf around the neck",
            "A vest over a simple tee",
            "Gold or brass jewelry — rings, a cuff, a chain",
            "A turban wrap if you're feeling it",
            "Sandals or go barefoot",
          ].map((item, i) => <p key={i} style={{ fontSize: "13px", color: "#8a7e70", margin: "0 0 8px", lineHeight: 1.5 }}>{item}</p>)}
        </div>
      </div>

      <div style={S.card}>
        <h3 style={{ fontSize: "16px", color: "#d4c8b8", margin: "0 0 14px", fontWeight: "400" }}>Colors That Work</h3>
        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: 0 }}>
          Gold, deep purple, emerald green, cobalt blue, burnt orange, burgundy, turquoise, crimson, black, or white. Basically anything rich and warm. Mix and layer — more is more.
        </p>
      </div>

      <div style={S.card}>
        <h3 style={{ fontSize: "16px", color: "#d4c8b8", margin: "0 0 14px", fontWeight: "400" }}>If You Want to Go All Out</h3>
        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: "0 0 16px" }}>
          Full kaftan, harem pants, ornate belt, turban, face gems, dramatic eyeliner, stacked bracelets wrist to elbow, pointed babouche slippers. A cape if you've got one. Go for it.
        </p>
        <h3 style={{ fontSize: "16px", color: "#d4c8b8", margin: "0 0 14px", fontWeight: "400" }}>If You Want to Keep It Easy</h3>
        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: 0 }}>
          A simple outfit in the right colors with one gold statement piece — a necklace, a belt, a cuff — and you're good.
        </p>
      </div>

      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <p style={{ fontSize: "13px", color: "#5a5448", fontStyle: "italic", lineHeight: 1.7 }}>
          Remember — you also picked a wine concept.
          <br />Your outfit can double as part of your presentation if you want it to.
        </p>
      </div>
    </div>
  );
}

// ==== TAB: THE ART ====
function TheArtTab() {
  const [revealed, setRevealed] = useState(false);
  return (
    <div style={{ padding: "0 20px 40px", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "400", color: "#f0e8dc", margin: "0 0 8px", letterSpacing: "2px", fontFamily: "'Playfair Display', 'Georgia', serif" }}>The Collective Masterpiece</h2>
        <p style={{ fontSize: "14px", color: "#7a6e60", fontStyle: "italic", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>Every year we create something together. This year is different.</p>
      </div>
      <Divider />

      <div style={{ ...S.card, textAlign: "center" }}>
        <div style={{ fontSize: "52px", marginBottom: "16px" }}>🧱</div>
        <h3 style={{ fontSize: "22px", color: gold, fontWeight: "400", margin: "0 0 18px", fontFamily: "'Playfair Display', 'Georgia', serif" }}>We're Building a LEGO Art</h3>
        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: "0 0 16px", maxWidth: "520px", marginLeft: "auto", marginRight: "auto" }}>
          Year one was paint on canvas. Year two was paint on each other. Year three — we're going three-dimensional. All 30 of us will build one massive collaborative artwork out of thousands of LEGO pieces.
        </p>
        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: "0 0 16px", maxWidth: "520px", marginLeft: "auto", marginRight: "auto" }}>
          Each person gets a numbered section with an instruction card. You walk up to the brick buffet table, pick the colors you need, find your section on the canvas, and start building. You'll use different types of LEGO pieces — round ones, flat ones, tall ones, slopes — to create a rich, textured, three-dimensional surface that looks like a painting made of bricks.
        </p>
        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: 0, maxWidth: "520px", marginLeft: "auto", marginRight: "auto" }}>
          When all 30 sections click together, a hidden image reveals itself. Nobody sees the full picture until the last piece is placed.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { number: "14,400+", label: "LEGO pieces" },
          { number: "15", label: "colors" },
          { number: "30", label: "builders" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", color: gold, fontFamily: "'Playfair Display', 'Georgia', serif" }}>{stat.number}</div>
            <div style={{ fontSize: "10px", color: "#5a5448", letterSpacing: "2px", marginTop: "4px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        {[
          { number: "~1 hour", label: "build time per person" },
          { number: "96 × 96 cm", label: "finished piece size" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "18px", textAlign: "center" }}>
            <div style={{ fontSize: "20px", color: gold, fontFamily: "'Playfair Display', 'Georgia', serif" }}>{stat.number}</div>
            <div style={{ fontSize: "10px", color: "#5a5448", letterSpacing: "2px", marginTop: "4px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Secret */}
      <div style={{ ...S.card, border: "1px solid rgba(212,175,55,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: "15px", color: "#c4b8a8", marginBottom: "10px" }}>What are we building?</div>
        {!revealed ? (
          <div>
            <p style={{ fontSize: "26px", color: gold, margin: "0 0 14px", fontFamily: "'Playfair Display', 'Georgia', serif" }}>That's a secret.</p>
            <p style={{ fontSize: "13px", color: "#6a6058", lineHeight: 1.7, margin: "0 0 20px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
              You'll each receive your section card at the party. You won't see the full image until the last piece clicks into place. Trust the process.
            </p>
            <button onClick={() => setRevealed(true)} style={{ padding: "12px 28px", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "24px", background: "rgba(212,175,55,0.08)", color: gold, cursor: "pointer", fontSize: "12px", letterSpacing: "2px", fontFamily: "inherit", transition: "all 0.3s ease" }}>
              I CAN'T WAIT
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "18px", color: gold, margin: "0 0 8px", fontStyle: "italic", fontFamily: "'Playfair Display', 'Georgia', serif" }}>Patience is a virtue, habibi.</p>
            <p style={{ fontSize: "13px", color: "#6a6058" }}>You'll find out at the party. Some things are worth waiting for.</p>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <p style={{ fontSize: "13px", color: "#4a4438", fontStyle: "italic", lineHeight: 1.8 }}>
          No experience needed. No artistic skill required.
          <br />Just your hands, a glass of wine, and a willingness to be part of something bigger.
          <br /><br />
          <span style={{ color: gold, opacity: 0.4 }}>The finished piece goes on the host's wall forever.</span>
        </p>
      </div>
    </div>
  );
}

// ==== TAB: GAMES ====
function GamesTab() {
  return (
    <div style={{ padding: "0 20px 40px", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "400", color: "#f0e8dc", margin: "0 0 8px", letterSpacing: "2px", fontFamily: "'Playfair Display', 'Georgia', serif" }}>The Games</h2>
        <p style={{ fontSize: "14px", color: "#7a6e60", fontStyle: "italic", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>Wine is the thread. The games are the knots.</p>
      </div>
      <Divider />

      {/* THE BAZAAR PITCH */}
      <div style={{ ...S.card, border: "1px solid rgba(212,175,55,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <span style={{ fontSize: "32px" }}>🛍</span>
          <div>
            <h3 style={{ fontSize: "20px", color: gold, margin: 0, fontWeight: "400", fontFamily: "'Playfair Display', 'Georgia', serif" }}>The Bazaar Pitch</h3>
            <div style={{ fontSize: "11px", color: "#5a5448", letterSpacing: "2px", marginTop: "2px" }}>ICEBREAKER</div>
          </div>
        </div>

        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: "0 0 16px" }}>
          The moment you walk through the door, you'll reach into a mystery bag and pull out a random object. It could be a rubber duck. A single sock. A wooden spoon. A doorknob. Something completely useless and utterly ridiculous.
        </p>
        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: "0 0 16px" }}>
          Hold onto it. Think about it. Because later in the afternoon, you'll stand before the entire group and have <span style={{ color: gold }}>30 seconds</span> to sell your object as the greatest treasure ever found in the bazaar.
        </p>
        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: "0 0 20px" }}>
          A rubber duck? That's a golden oracle pulled from the rivers of Babylon — whoever holds it can see the future but only on Tuesdays. A single sock? Woven from the silk of a spider that only spins under a crescent moon in the mountains of Cappadocia. A wooden spoon? The very spoon the Sultan's chef used to stir the broth that ended a 40-year war.
        </p>

        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "18px", marginBottom: "16px" }}>
          <h4 style={{ fontSize: "13px", color: "#c4b8a8", margin: "0 0 12px" }}>The Rules</h4>
          {[
            "You pick your object from the mystery bag when you arrive. No swapping.",
            "When the Bazaar is called, each person steps up one at a time.",
            "You have 30 seconds to pitch your object to the crowd. Be loud. Be dramatic. Be absurd.",
            "You must stay in character as a merchant. The more ridiculous the backstory, the better.",
            "The crowd votes on the best pitch. The winner is crowned Grand Merchant of the Bazaar.",
          ].map((rule, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
              <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: `1px solid ${gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: gold, flexShrink: 0, opacity: 0.6 }}>{i + 1}</div>
              <p style={{ fontSize: "12px", color: "#7a6e60", margin: 0, lineHeight: 1.6 }}>{rule}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "13px", color: "#5a5448", fontStyle: "italic", textAlign: "center", margin: 0 }}>
          Pro tip: The people who commit the hardest always win. Whisper. Yell. Get on your knees. Wave the object in someone's face. This is the bazaar — there is no dignity here.
        </p>
      </div>

      {/* TRIVIA */}
      <div style={S.card}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <span style={{ fontSize: "32px" }}>🧠</span>
          <div>
            <h3 style={{ fontSize: "20px", color: "#6ba3d6", margin: 0, fontWeight: "400", fontFamily: "'Playfair Display', 'Georgia', serif" }}>Trivia</h3>
            <div style={{ fontSize: "11px", color: "#5a5448", letterSpacing: "2px", marginTop: "2px" }}>TRADITION</div>
          </div>
        </div>

        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: "0 0 16px" }}>
          The trivia tradition continues. This year's rounds are themed to The Thousand & One Night — expect questions about wine, the Arabian Nights world, and a few curveballs that will separate the confident from the correct.
        </p>
        <p style={{ fontSize: "13px", color: "#7a6e60", lineHeight: 1.7, margin: 0 }}>
          Teams will be formed at the party. No prep needed — just bring your brain and your willingness to argue passionately about things you're not sure about.
        </p>
      </div>

      {/* MUSIC ROUND */}
      <div style={S.card}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <span style={{ fontSize: "32px" }}>🎵</span>
          <div>
            <h3 style={{ fontSize: "20px", color: "#e8a832", margin: 0, fontWeight: "400", fontFamily: "'Playfair Display', 'Georgia', serif" }}>Name That Tale</h3>
            <div style={{ fontSize: "11px", color: "#5a5448", letterSpacing: "2px", marginTop: "2px" }}>MUSIC ROUND</div>
          </div>
        </div>

        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: "0 0 16px" }}>
          A clip of a song will play. Every song is connected to the Arabian Nights world — from iconic Middle Eastern and Arabic tracks to songs you might recognize from unexpected places. Your job is to guess the song name, the artist, or both.
        </p>
        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: "0 0 16px" }}>
          Some will be obvious. Some will make you argue with your entire team. Some you'll swear you've heard before but can't place. That's the fun.
        </p>
        <p style={{ fontSize: "13px", color: "#5a5448", fontStyle: "italic", textAlign: "center", margin: 0 }}>
          One point for the song. One point for the artist. The playlist stays secret until the day.
        </p>
      </div>

      {/* THE FORBIDDEN WORD */}
      <div style={S.card}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <span style={{ fontSize: "32px" }}>🚫</span>
          <div>
            <h3 style={{ fontSize: "20px", color: "#e8446a", margin: 0, fontWeight: "400", fontFamily: "'Playfair Display', 'Georgia', serif" }}>The Forbidden Word</h3>
            <div style={{ fontSize: "11px", color: "#5a5448", letterSpacing: "2px", marginTop: "2px" }}>ALL AFTERNOON</div>
          </div>
        </div>

        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: "0 0 16px" }}>
          At the start of the party, one common word will be banned for the entire afternoon. A word you'd normally say without thinking. A word that's almost impossible to avoid at a wine tasting party.
        </p>
        <p style={{ fontSize: "14px", color: "#a89e8e", lineHeight: 1.8, margin: "0 0 16px" }}>
          Every time someone says it, they get caught. Anyone can call you out — your partner, a stranger, someone across the garden who heard you slip. There is no mercy in the bazaar.
        </p>

        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "18px", marginBottom: "16px" }}>
          <h4 style={{ fontSize: "13px", color: "#c4b8a8", margin: "0 0 12px" }}>What Happens When You Get Caught</h4>
          {[
            { offense: "1st offense", consequence: "You pull an item from the penalty bag — a tiny hat, a fake mustache, a plastic tiara, a feather boa, a pair of oversized sunglasses. You wear it for the rest of the party. No exceptions." },
            { offense: "2nd offense", consequence: "You drink. Whatever's in your glass, finish it." },
            { offense: "3rd offense", consequence: "You stand up and serenade the group. Sing anything — a lullaby, a pop song, a made-up anthem. Doesn't matter. You're performing." },
            { offense: "4th+ offense", consequence: "The penalties keep stacking. More items from the bag. More drinks. By the end of the afternoon, the repeat offenders look like they got dressed in the dark inside a costume shop — and that's exactly the point." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "14px", alignItems: "flex-start" }}>
              <div style={{ fontSize: "11px", color: "#e8446a", fontFamily: "monospace", opacity: 0.7, paddingTop: "3px", flexShrink: 0, minWidth: "75px" }}>{item.offense}</div>
              <p style={{ fontSize: "12px", color: "#7a6e60", margin: 0, lineHeight: 1.7 }}>{item.consequence}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "13px", color: "#5a5448", fontStyle: "italic", textAlign: "center", margin: 0 }}>
          The forbidden word will be revealed when you arrive. Start practicing your synonyms now.
        </p>
      </div>

      {/* More surprises */}
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <p style={{ fontSize: "14px", color: "#4a4438", fontStyle: "italic", lineHeight: 1.7 }}>
          There may be other surprises throughout the afternoon.
          <br />
          <span style={{ color: gold, opacity: 0.4 }}>But if we told you everything, it wouldn't be The Thousand & One Night.</span>
        </p>
      </div>
    </div>
  );
}

// ==== MAIN ====
export default function PartyInvite() {
  const [activeTab, setActiveTab] = useState("The Event");

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(170deg, #0a0a0f 0%, #1a1008 40%, #0c0a14 70%, #0a0a0f 100%)", fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif", color: "#e8e0d4" }}>
      <div style={{ height: "3px", background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, opacity: 0.5 }} />

      {/* Nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,15,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(212,175,55,0.1)", padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap", maxWidth: "600px", margin: "0 auto" }}>
          {mainTabs.map((tab) => {
            const active = activeTab === tab;
            return <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "10px 18px", border: active ? `1px solid rgba(212,175,55,0.4)` : "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", background: active ? "rgba(212,175,55,0.12)" : "transparent", color: active ? gold : "#5a5448", cursor: "pointer", fontSize: "12px", letterSpacing: "1px", transition: "all 0.3s ease", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}><span style={{ fontSize: "14px" }}>{tabIcons[tab]}</span>{tab}</button>;
          })}
        </div>
      </div>

      <div style={{ paddingTop: "10px" }}>
        {activeTab === "The Event" && <TheEventTab />}
        {activeTab === "Wine Tasting" && <WineTastingTab />}
        {activeTab === "Games" && <GamesTab />}
        {activeTab === "Dress Code" && <DressCodeTab />}
        {activeTab === "The Art" && <TheArtTab />}
      </div>

      <div style={{ height: "3px", background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, opacity: 0.3 }} />
    </div>
  );
}
