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
  if (req.method === "OPTIONS") {
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
      secretKeyValid: secretKey && !secretKey.includes('your_secret_key'),
      publicKeyValid: publicKey && !publicKey.includes('your_public_key'),
    });

    if (!secretKey || !publicKey || secretKey.includes('your_secret_key') || publicKey.includes('your_public_key')) {
      console.error('[PIX Payment] Payment gateway not configured properly');
      return new Response(
        JSON.stringify({
          error: "Payment gateway not configured",
          details: "As chaves de API do gateway de pagamento não foram configuradas. Configure PAYZOR_SECRET_KEY e PAYZOR_PUBLIC_KEY nas variáveis de ambiente."
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
    const payzorResponse = await fetch("https://api.payzor.com.br/api/v1/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payzorPayload),
    });

    console.log('[PIX Payment] Payzor response status:', payzorResponse.status);

    if (!payzorResponse.ok) {
      const errorData = await payzorResponse.text();
      console.error('[PIX Payment] Payzor API Error:', errorData);
      throw new Error(`Payzor API returned ${payzorResponse.status}: ${errorData}`);
    }

    const payzorData = await payzorResponse.json();
    console.log('[PIX Payment] Payment created successfully:', payzorData.id);

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
