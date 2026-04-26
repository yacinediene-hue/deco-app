import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, email, phone, productId, productName } = await req.json();

  if (!name || !email || !productId) {
    return NextResponse.json({ error: "Champs requis : name, email, productId" }, { status: 422 });
  }

  // Récupérer les infos vendeur
  const product = await prisma.accessoryCatalog.findUnique({
    where: { id: productId },
    select: { name: true, priceFcfa: true, vendorName: true, vendorContactWhatsapp: true, city: true },
  });

  const productLabel = product?.name ?? productName ?? productId;
  const price = product
    ? new Intl.NumberFormat("fr-FR").format(product.priceFcfa) + " FCFA"
    : "";

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "DecoApp <noreply@decoapp.co>",
      to: [email],
      subject: `✅ Demande de réservation — ${productLabel}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#1c1917;">Bonjour ${name} 👋</h2>
          <p>Ta demande de réservation a bien été reçue !</p>
          <div style="background:#f5f5f4;border-radius:12px;padding:16px;margin:16px 0;">
            <p style="margin:0;font-weight:600;color:#1c1917;">${productLabel}</p>
            ${price ? `<p style="margin:4px 0 0;color:#78716c;">Prix : ${price}</p>` : ""}
            ${product?.city ? `<p style="margin:4px 0 0;color:#78716c;">📍 ${product.city}</p>` : ""}
            ${product?.vendorName ? `<p style="margin:4px 0 0;color:#78716c;">Vendeur : ${product.vendorName}</p>` : ""}
          </div>
          <p>Le vendeur va te contacter <strong>dans les 24h</strong> pour confirmer et organiser la livraison.</p>
          ${phone ? `<p>Tu as fourni le numéro WhatsApp : <strong>${phone}</strong></p>` : ""}
          <hr style="border:none;border-top:1px solid #e7e5e4;margin:24px 0;" />
          <p style="font-size:12px;color:#a8a29e;">DecoApp · Première app déco pensée pour l'Afrique francophone</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[reserve] email error", err);
    // On ne bloque pas la réservation si l'email échoue
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
