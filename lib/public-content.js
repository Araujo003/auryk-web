(function () {
  "use strict";
  const api = window.AurykAPI;
  const safeText = (selector, value) => { const el = document.querySelector(selector); if (el && value) el.textContent = value; };
  const safeHref = (selector, value) => { const el = document.querySelector(selector); if (el && /^(https?:|mailto:|tel:|#)/.test(value || "")) el.href = value; };
  function applyHome(row) {
    if (!row) return;
    safeText("[data-cms='home.eyebrow']", row.eyebrow);
    const hero = document.querySelector("[data-cms='home.hero_title']");
    if (hero && row.hero_title) hero.textContent = row.hero_title;
    safeText("[data-cms='home.subtitle']", row.subtitle);
  }
  function applySettings(rows) {
    const map = Object.fromEntries((rows || []).map(x => [x.key, x.value]));
    if (map.meta_title) document.title = map.meta_title;
    const meta = document.querySelector('meta[name="description"]'); if (meta && map.meta_description) meta.content = map.meta_description;
    safeHref("a[href^='tel:']", map.phone ? `tel:${map.phone}` : "");
    safeHref("a[href^='mailto:']", map.email ? `mailto:${map.email}` : "");
  }
  function applyCards(selector, rows, titleSelector, descSelector) {
    const cards = [...document.querySelectorAll(selector)];
    (rows || []).forEach((row, index) => {
      const card = cards[index]; if (!card) return;
      const title = card.querySelector(titleSelector), desc = card.querySelector(descSelector), img = card.querySelector("img");
      if (title && row.title) title.textContent = row.title;
      if (desc && (row.short_description || row.description)) desc.textContent = row.short_description || row.description;
      if (img && (row.image_url || row.cover_image_url)) { img.src = row.image_url || row.cover_image_url; img.alt = row.alt_text || row.title || ""; }
      card.hidden = false;
    });
    cards.slice((rows || []).length).forEach(card => { if (rows?.length) card.hidden = true; });
  }
  function applyClients(rows) {
    const slots = [...document.querySelectorAll(".logo-slot")];
    (rows || []).forEach((row, i) => { if (!slots[i]) return; slots[i].textContent = row.public_name || ""; slots[i].hidden = false; });
    slots.slice((rows || []).length).forEach(x => { if (rows?.length) x.hidden = true; });
  }
  async function hydrate() {
    if (!api?.configured) { document.documentElement.dataset.cms = "fallback"; return; }
    try {
      const [home, settings, management, services, projects, clients] = await Promise.all([
        api.select("home_content", "select=*&status=eq.published&is_visible=eq.true&order=sort_order.asc&limit=1"),
        api.select("site_settings", "select=key,value&is_public=eq.true"),
        api.select("management_modules", "select=*&status=eq.published&is_visible=eq.true&order=sort_order.asc"),
        api.select("services", "select=*&status=eq.published&is_visible=eq.true&order=sort_order.asc"),
        api.select("projects", "select=id,title,slug,discipline,service,sector,location,project_date,description,problem,solution,result,story,scope,benefits,cta_label,cta_url,cover_image_url,alt_text,featured_home,status,sort_order,published_at&status=eq.published&order=sort_order.asc"),
        api.select("clients", "select=public_name,logo_url,sector,description,sort_order&publish_authorized=eq.true&is_visible=eq.true&order=sort_order.asc")
      ]);
      applyHome(home[0]); applySettings(settings);
      applyCards("[data-management]", management, ".management-title", ".management-desc");
      applyCards("[data-service]", services, ".service-title", ".service-desc");
      applyCards("[data-case]", projects, ".case-title", ".case-desc");
      applyClients(clients);
      window.AurykCMSData = { home: home[0] || null, management, services, projects, clients };
      window.dispatchEvent(new CustomEvent("auryk:content-ready", { detail: { source: "supabase" } }));
      document.documentElement.dataset.cms = "live";
    } catch (error) {
      console.warn("Auryk CMS fallback activo:", error.message);
      document.documentElement.dataset.cms = "fallback";
      window.dispatchEvent(new CustomEvent("auryk:content-ready", { detail: { source: "fallback" } }));
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hydrate, { once: true }); else hydrate();
})();
