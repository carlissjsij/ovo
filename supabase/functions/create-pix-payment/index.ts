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

function generatePixCode(amount: number): string {
  const pixKey = "00020126330014BR.GOV.BCB.PIX0111";
  const merchantName = "2600014BR.GOV.BCB.PIX";
  const value = (amount / 100).toFixed(2);
  return `${pixKey}${merchantName}5303986540${value.length}${value}5802BR5913ReceitaFederal6009SAO PAULO62070503***6304`;
}

async function generateQRCodeDataURL(text: string): Promise<string> {
  const QRCode = await import("npm:qrcode@1.5.3");
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
  });
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

    const pixCode = generatePixCode(amount);
    const qrcodeUrl = await generateQRCodeDataURL(pixCode);
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
      JSON.stringify({ error: "Internal server error" }),
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
