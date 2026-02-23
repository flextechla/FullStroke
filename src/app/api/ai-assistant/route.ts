import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// Uses Claude Haiku 4.5 via Anthropic API
// 1. Go to console.anthropic.com
// 2. Create an API key
// 3. Add to .env.local: ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx

const SYSTEM_PROMPT = `You are a helpful assistant for a small engine repair shop called "Curt's Small Engine Repair". You help create tickets, look up tickets, and answer questions about the shop's data.

When the user wants to CREATE A TICKET, extract these fields from their message:
- customer_name
- customer_phone
- customer_email
- customer_address
- equipment_type (e.g. lawn mower, chainsaw, trimmer, blower, generator, pressure washer)
- equipment_brand (e.g. Honda, Stihl, Husqvarna, Toro, Briggs & Stratton, John Deere)
- equipment_model
- equipment_serial
- equipment_year
- problem_description
- status (default: "intake")

Respond with a JSON object like:
{"action": "create_ticket", "data": { ...fields... }, "message": "I'll create a ticket for [customer] with a [equipment]. Sound good?"}

Only include fields that were mentioned. Leave out fields you don't have info for.

When the user wants to SEARCH or LOOK UP tickets, respond with:
{"action": "search_tickets", "query": "the search term", "message": "Let me look that up..."}

The query should be a customer name, invoice number, or equipment type.

When the user wants to KNOW ABOUT THE SHOP (counts, stats, etc), respond with:
{"action": "get_stats", "message": "Let me check the numbers..."}

When the user CONFIRMS a ticket creation (says yes, confirm, create it, go ahead, looks good, do it, submit, correct, that's right, yep, sure), respond with:
{"action": "confirm_create", "message": "Creating the ticket now..."}

For GENERAL QUESTIONS or CONVERSATION, respond with:
{"action": "chat", "message": "your helpful response"}

Always respond with valid JSON only. No markdown, no code fences. Be friendly and concise.`;

async function callClaude(messages: { role: string; content: string }[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Anthropic API error");
  }

  const text = data.content[0]?.text || "{}";
  // Strip any markdown code fences if present
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory, pendingTicketData } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI not configured. Add ANTHROPIC_API_KEY to your .env.local file." },
        { status: 500 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("workspace_id")
      .eq("id", user.id)
      .single();

    if (!profile?.workspace_id) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    // Build conversation for AI
    const claudeMessages = [
      ...(conversationHistory || []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const aiResponse = await callClaude(claudeMessages);

    // Handle confirm_create — use pending ticket data
    if (aiResponse.action === "confirm_create" && pendingTicketData) {
      const d = pendingTicketData;
      const invoiceNumber = `FS-${Date.now().toString(36).toUpperCase()}`;

      let customerId = null;
      if (d.customer_name) {
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("workspace_id", profile.workspace_id)
          .ilike("name", d.customer_name)
          .limit(1)
          .single();

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const { data: newCustomer } = await supabase
            .from("customers")
            .insert({
              workspace_id: profile.workspace_id,
              name: d.customer_name,
              email: d.customer_email || null,
              phone: d.customer_phone || null,
              address: d.customer_address || null,
            })
            .select("id")
            .single();
          if (newCustomer) customerId = newCustomer.id;
        }
      }

      const { data: newTicket, error: ticketErr } = await supabase
        .from("tickets")
        .insert({
          workspace_id: profile.workspace_id,
          invoice_number: invoiceNumber,
          ticket_date: new Date().toISOString().split("T")[0],
          status: d.status || "intake",
          customer_id: customerId,
          customer_name: d.customer_name || null,
          customer_email: d.customer_email || null,
          customer_phone: d.customer_phone || null,
          customer_address: d.customer_address || null,
          equipment_type: d.equipment_type || null,
          equipment_brand: d.equipment_brand || null,
          equipment_model: d.equipment_model || null,
          equipment_serial: d.equipment_serial || null,
          equipment_year: d.equipment_year || null,
          problem_description: d.problem_description || null,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (ticketErr) {
        return NextResponse.json({
          action: "error",
          message: `Failed to create ticket: ${ticketErr.message}`,
        });
      }

      return NextResponse.json({
        action: "ticket_created",
        ticketId: newTicket?.id,
        invoiceNumber,
        message: `✅ Ticket ${invoiceNumber} created for ${d.customer_name || "customer"}! Tap to view it.`,
      });
    }

    // Handle create_ticket — show preview first
    if (aiResponse.action === "create_ticket") {
      return NextResponse.json({
        action: "confirm_ticket",
        data: aiResponse.data || {},
        message: aiResponse.message || "Here's what I have. Say 'yes' or 'create it' to confirm.",
      });
    }

    if (aiResponse.action === "search_tickets") {
      const query = aiResponse.query || message;

      const { data: tickets } = await supabase
        .from("tickets")
        .select(
          "id, invoice_number, customer_name, status, equipment_brand, equipment_type, ticket_date, grand_total"
        )
        .eq("workspace_id", profile.workspace_id)
        .or(
          `customer_name.ilike.%${query}%,invoice_number.ilike.%${query}%,equipment_brand.ilike.%${query}%,equipment_type.ilike.%${query}%`
        )
        .order("created_at", { ascending: false })
        .limit(5);

      if (!tickets || tickets.length === 0) {
        return NextResponse.json({
          action: "search_results",
          tickets: [],
          message: `No tickets found for "${query}". Try a different name or number.`,
        });
      }

      return NextResponse.json({
        action: "search_results",
        tickets,
        message: `Found ${tickets.length} ticket${tickets.length > 1 ? "s" : ""}:`,
      });
    }

    if (aiResponse.action === "get_stats") {
      const [ticketRes, customerRes, partRes] = await Promise.all([
        supabase
          .from("tickets")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", profile.workspace_id),
        supabase
          .from("customers")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", profile.workspace_id),
        supabase.from("parts").select("id", { count: "exact", head: true }),
      ]);

      return NextResponse.json({
        action: "stats",
        message: `📊 You have ${ticketRes.count ?? 0} tickets, ${customerRes.count ?? 0} customers, and ${partRes.count ?? 0} parts in stock.`,
      });
    }

    return NextResponse.json({
      action: "chat",
      message:
        aiResponse.message ||
        "I'm not sure how to help with that. Try asking me to create a ticket or look one up!",
    });
  } catch (err) {
    console.error("AI Assistant error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}