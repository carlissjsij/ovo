import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ALLOWED_DOMAIN = "faberbrasil.top";
const ALLOWED_DOMAINS = [
  "faberbrasil.top",
  "www.faberbrasil.top",
  "localhost",
  "127.0.0.1"
];

const SECRET_KEY = "FaberBrasil2026SecureKey#";

async function generateToken(domain: string): Promise<string> {
  const timestamp = Date.now();
  const payload = `${domain}|${timestamp}|${SECRET_KEY}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  const token = btoa(`${domain}:${timestamp}:${hash}`);
  return token;
}

async function validateToken(token: string, domain: string): Promise<boolean> {
  try {
    const decoded = atob(token);
    const [tokenDomain, timestamp, hash] = decoded.split(":");

    if (tokenDomain !== domain) {
      return false;
    }

    const now = Date.now();
    const tokenTime = parseInt(timestamp);
    const fiveMinutes = 5 * 60 * 1000;

    if (now - tokenTime > fiveMinutes) {
      return false;
    }

    const payload = `${tokenDomain}|${timestamp}|${SECRET_KEY}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const expectedHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    return hash === expectedHash;
  } catch {
    return false;
  }
}

function isAllowedDomain(domain: string): boolean {
  return ALLOWED_DOMAINS.some(allowed =>
    domain === allowed ||
    domain.endsWith(`.${allowed}`) ||
    domain.includes(allowed)
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "validate") {
      const body = await req.json();
      const { domain, token } = body;

      if (!domain) {
        return new Response(
          JSON.stringify({
            valid: false,
            redirect: `https://${ALLOWED_DOMAIN}`,
            reason: "missing_domain"
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const allowed = isAllowedDomain(domain);

      if (!allowed) {
        return new Response(
          JSON.stringify({
            valid: false,
            redirect: `https://${ALLOWED_DOMAIN}`,
            reason: "unauthorized_domain"
          }),
          {
            status: 403,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (token) {
        const tokenValid = await validateToken(token, domain);
        if (!tokenValid) {
          return new Response(
            JSON.stringify({
              valid: false,
              redirect: `https://${ALLOWED_DOMAIN}`,
              reason: "invalid_token"
            }),
            {
              status: 403,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
        }
      }

      const newToken = await generateToken(domain);

      return new Response(
        JSON.stringify({
          valid: true,
          token: newToken,
          domain: domain
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "check") {
      const body = await req.json();
      const { domain } = body;

      const allowed = isAllowedDomain(domain);

      return new Response(
        JSON.stringify({
          valid: allowed,
          redirect: allowed ? null : `https://${ALLOWED_DOMAIN}`
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Invalid action",
        valid: false,
        redirect: `https://${ALLOWED_DOMAIN}`
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        valid: false,
        redirect: `https://${ALLOWED_DOMAIN}`
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
