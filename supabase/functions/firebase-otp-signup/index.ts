import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { decode } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, fullName, department, firebaseToken, phone } =
      await req.json();

    if (!firebaseToken) {
      throw new Error("Missing Firebase verification token.");
    }

    // 1. Decode the Firebase ID Token (RS256 JWT signed by Google)
    const [_header, payload, _signature] = decode(firebaseToken);

    // Verify issuer matches the Firebase project
    const firebaseProjectId = Deno.env.get("FIREBASE_PROJECT_ID");
    if (
      payload.iss !==
      `https://securetoken.google.com/${firebaseProjectId}`
    ) {
      throw new Error("Invalid token issuer.");
    }

    // Verify the token has not expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error("Firebase token has expired.");
    }

    // Verify the verified phone number matches the registration phone number
    const verifiedPhone = payload.phone_number; // e.g. "+919876543210"
    const expectedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
    if (verifiedPhone !== expectedPhone) {
      throw new Error(
        "Token phone number does not match registration phone number."
      );
    }

    // 2. Initialize Supabase Admin Client (service role bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 3. Create the user in Supabase Auth (server-side, secure)
    const { data: userData, error: signupError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          phone_number: phone,
          department,
          phone_verified: true,
        },
      });

    if (signupError) throw signupError;

    return new Response(
      JSON.stringify({
        success: true,
        message: "User registered successfully!",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
