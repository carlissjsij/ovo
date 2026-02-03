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
    const body: PaymentRequest = await req.json();
    const { amount, customerCpf, customerName, customerEmail, customerPhone } = body;

    if (!amount || !customerCpf || !customerName || !customerEmail || !customerPhone) {
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

    if (!secretKey || !publicKey) {
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
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

    const payzorResponse = await fetch("https://api.payzor.com.br/api/v1/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payzorPayload),
    });

    if (!payzorResponse.ok) {
      const errorData = await payzorResponse.text();
      console.error("Payzor API Error:", errorData);
      throw new Error(`Payzor API returned ${payzorResponse.status}`);
    }

    const payzorData = await payzorResponse.json();

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
