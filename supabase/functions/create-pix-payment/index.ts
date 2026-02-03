import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import QRCode from "npm:qrcode@1.5.3";

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

function generatePixCode(amount: number, cpf: string): string {
  const value = (amount / 100).toFixed(2);
  const pixKey = Deno.env.get("PIX_KEY") || "32401842000177";
  const merchantName = Deno.env.get("PIX_MERCHANT_NAME") || "Receita Federal";
  const merchantCity = Deno.env.get("PIX_MERCHANT_CITY") || "SAO PAULO";

  const merchantNameFormatted = merchantName.replace(/\s+/g, '');
  const merchantCityFormatted = merchantCity.replace(/\s+/g, '');

  const payload = [
    "00020126",
    "580014BR.GOV.BCB.PIX01" + String(pixKey.length).padStart(2, '0') + pixKey,
    "52040000",
    "5303986",
    "54" + String(value.length).padStart(2, '0') + value,
    "5802BR",
    "59" + String(merchantNameFormatted.length).padStart(2, '0') + merchantNameFormatted,
    "60" + String(merchantCityFormatted.length).padStart(2, '0') + merchantCityFormatted,
    "62070503***",
    "6304"
  ].join("");

  return payload;
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
    const { amount, customerCpf } = body;

    if (!amount || !customerCpf) {
      return new Response(
        JSON.stringify({ error: "Amount and CPF are required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const pixCode = generatePixCode(amount, customerCpf);

    const qrcodeUrl = await QRCode.toDataURL(pixCode, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 256,
    });

    const transactionId = crypto.randomUUID();

    const data = {
      id: transactionId,
      status: "pending",
      amount: amount,
      pix: {
        qrcode: pixCode,
        qrcodeUrl: qrcodeUrl,
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
