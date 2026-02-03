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

function crc16(payload: string): string {
  let crc = 0xFFFF;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }

  crc = crc & 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function generatePixCode(amount: number, cpf: string): string {
  const value = (amount / 100).toFixed(2);
  const pixKey = "32401842000177";
  const merchantName = "Receita Federal";
  const merchantCity = "SAO PAULO";
  const txid = crypto.randomUUID().replace(/-/g, '').substring(0, 25);

  const payload = [
    "00020101",
    "02",
    "26",
    ("0014BR.GOV.BCB.PIX01" + String(pixKey.length).padStart(2, '0') + pixKey).length.toString().padStart(2, '0') + "0014BR.GOV.BCB.PIX01" + String(pixKey.length).padStart(2, '0') + pixKey,
    "52040000",
    "5303986",
    "54" + String(value.length).padStart(2, '0') + value,
    "5802BR",
    "59" + String(merchantName.length).padStart(2, '0') + merchantName,
    "60" + String(merchantCity.length).padStart(2, '0') + merchantCity,
    "62" + (String(txid.length + 4).padStart(2, '0')) + "05" + String(txid.length).padStart(2, '0') + txid,
    "6304"
  ].join("");

  const checksum = crc16(payload);
  return payload + checksum;
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
