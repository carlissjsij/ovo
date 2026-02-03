import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PaymentRequest {
  amount: number;
  customerCpf: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

Deno.serve(async (req: Request) => {
  console.log('[PIX Payment] Function called - Method:', req.method);

  if (req.method === "OPTIONS") {
    console.log('[PIX Payment] Handling OPTIONS preflight');
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('[PIX Payment] Received request');
    const body: PaymentRequest = await req.json();
    const { amount, customerCpf, customerName, customerEmail, customerPhone } = body;

    console.log('[PIX Payment] Request data:', {
      amount,
      customerCpf: customerCpf?.substring(0, 3) + '***',
      customerName,
      customerEmail,
    });

    if (!amount || !customerCpf || !customerName || !customerEmail || !customerPhone) {
      console.error('[PIX Payment] Missing required fields');
      return new Response(
        JSON.stringify({ error: "All customer fields are required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const secretKey = Deno.env.get("PAYZOR_SECRET_KEY");
    const publicKey = Deno.env.get("PAYZOR_PUBLIC_KEY");

    console.log('[PIX Payment] Checking credentials:', {
      hasSecretKey: !!secretKey,
      hasPublicKey: !!publicKey,
      secretKeyLength: secretKey?.length,
      publicKeyLength: publicKey?.length,
    });

    if (!secretKey || !publicKey) {
      console.error('[PIX Payment] Missing credentials');
      return new Response(
        JSON.stringify({
          error: "Credenciais não configuradas",
          details: "Configure PAYZOR_SECRET_KEY e PAYZOR_PUBLIC_KEY no Supabase."
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

    const credentials = btoa(`${secretKey}:${publicKey}`);

    const payzorPayload = {
      amount: amount,
      paymentMethod: "PIX",
      externalRef: `IOF-${Date.now()}`,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        document: {
          type: "CPF",
          number: customerCpf,
        },
      },
      items: [
        {
          title: "IOF - Imposto sobre Operações Financeiras",
          description: "Pagamento obrigatório IOF",
          unitPrice: amount,
          quantity: 1,
        },
      ],
      pix: {
        expiresInDays: 1,
      },
    };

    console.log('[PIX Payment] Calling Payzor API...');
    console.log('[PIX Payment] Payload:', JSON.stringify(payzorPayload, null, 2));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let payzorResponse;
    try {
      payzorResponse = await fetch("https://api.payzor.com.br/api/v1/transactions", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payzorPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('[PIX Payment] Fetch error:', {
        name: fetchError.name,
        message: fetchError.message,
        cause: fetchError.cause,
      });

      const isTimeout = fetchError.name === 'AbortError';

      return new Response(
        JSON.stringify({
          error: "Erro ao conectar com gateway de pagamento",
          details: isTimeout
            ? "Timeout ao conectar com Payzor (10s). Verifique sua conexão e credenciais."
            : `Não foi possível conectar com o Payzor: ${fetchError.message}`
        }),
        {
          status: 503,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log('[PIX Payment] Payzor response status:', payzorResponse.status);

    if (!payzorResponse.ok) {
      const errorData = await payzorResponse.text();
      console.error('[PIX Payment] Payzor API Error:', {
        status: payzorResponse.status,
        statusText: payzorResponse.statusText,
        body: errorData
      });

      return new Response(
        JSON.stringify({
          error: `Erro na API Payzor (${payzorResponse.status})`,
          details: errorData || payzorResponse.statusText
        }),
        {
          status: payzorResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const payzorData = await payzorResponse.json();
    console.log('[PIX Payment] Payment created successfully:', {
      id: payzorData.id,
      status: payzorData.status
    });

    const data = {
      id: payzorData.id,
      status: payzorData.status,
      amount: payzorData.amount,
      pix: {
        qrcode: payzorData.pix.qrcode,
        qrcodeUrl: payzorData.pix.qrcodeUrl,
        expirationDate: payzorData.pix.expirationDate,
      },
    };

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message
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
