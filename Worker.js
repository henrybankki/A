export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    // =====================
    // GET STATE
    // =====================
    if (url.pathname === "/state") {
      const state = await env.KV.get("state", "json") || {
        token: "",
        launchTime: null,
        launched: false,
        feed: []
      };

      return Response.json(state);
    }

    // =====================
    // ADMIN UPDATE
    // =====================
    if (url.pathname === "/admin" && req.method === "POST") {
      const body = await req.json();

      let state = await env.KV.get("state", "json") || {};

      if (body.token !== undefined) state.token = body.token;
      if (body.launchTime !== undefined) state.launchTime = body.launchTime;
      if (body.launched !== undefined) state.launched = body.launched;

      await env.KV.put("state", JSON.stringify(state));

      return Response.json({ ok: true, state });
    }

    // =====================
    // AUTO LAUNCH CHECK
    // =====================
    if (url.pathname === "/tick") {
      let state = await env.KV.get("state", "json") || {};

      if (state.launchTime && Date.now() > state.launchTime) {
        state.launched = true;

        // viral feed inject
        state.feed.unshift({
          text: "🐹 WATTI IS LIVE ⚡",
          time: Date.now()
        });

        await env.KV.put("state", JSON.stringify(state));
      }

      return Response.json({ ok: true, state });
    }

    return new Response("Watti API");
  }
};
