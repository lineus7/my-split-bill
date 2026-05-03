"use server";

import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/auth";
import { getGeneralValue } from "@/shared/lib/general";
import { GENERAL_KEYS } from "@/shared/constants/general-keys";
import { scanBillSchema, type ScanBillResult } from "../schemas/scan-bill-schema";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB

const SCAN_PROMPT = `You are an expert at extracting structured data from restaurant or cafe receipts.

Analyze the receipt image and extract the following information:
- title: The restaurant or merchant name
- items: Each line item ordered (name, price per unit in IDR as a number without currency symbol, quantity)
  - addOns: Any modifiers or extras for that specific item (e.g. extra toppings, sauces)
- taxAmount: Total tax or PPN as a flat number in IDR (0 if not present)
- serviceAmount: Total service charge as a flat number in IDR (0 if not present)
- additionalCharges: Any other surcharges or discounts not covered above
  - kind must be "CHARGE" for extra fees or "DISCOUNT" for deductions
  - amount is always a positive number

Rules:
- All monetary values must be plain numbers in IDR (Indonesian Rupiah), no symbols or commas
- If a field cannot be detected, use 0 for numbers or empty array for lists
- price in items is the price per single unit, not the total for that line
- Do not include tax/service charge as regular items`;

const RESPONSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          price: { type: "number" },
          quantity: { type: "integer" },
          addOns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                price: { type: "number" },
                quantity: { type: "integer" },
              },
              required: ["name", "price", "quantity"],
            },
          },
        },
        required: ["name", "price", "quantity", "addOns"],
      },
    },
    taxAmount: { type: "number" },
    serviceAmount: { type: "number" },
    additionalCharges: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          amount: { type: "number" },
          kind: { type: "string", enum: ["CHARGE", "DISCOUNT"] },
        },
        required: ["name", "amount", "kind"],
      },
    },
  },
  required: ["title", "items", "taxAmount", "serviceAmount", "additionalCharges"],
};

export type ScanBillState = {
  data?: ScanBillResult;
  error?: string;
};

export async function scanBillAction(
  _prevState: ScanBillState,
  formData: FormData
): Promise<ScanBillState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const file = formData.get("image") as File | null;
  if (!file || !file.type.startsWith("image/")) {
    return { error: "Please provide a valid image file" };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { error: "Image must be smaller than 8 MB" };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "AI service is not configured" };
  }

  const modelName =
    (await getGeneralValue(GENERAL_KEYS.geminiModel)) ?? "gemini-2.5-flash";

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  const ai = new GoogleGenAI({ apiKey });

  let responseText: string | undefined;
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            { text: SCAN_PROMPT },
            { inlineData: { mimeType: file.type, data: base64 } },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: RESPONSE_JSON_SCHEMA,
      },
    });
    responseText = response.text;
  } catch (err) {
    console.error("Gemini API error:", err);
    return { error: "Failed to analyze the image. Please try again." };
  }

  if (!responseText) {
    return { error: "No response from AI. Please try again." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    return { error: "Failed to parse AI response. Please try again." };
  }

  const result = scanBillSchema.safeParse(parsed);
  if (!result.success) {
    return { error: "Could not extract bill data from this image." };
  }

  return { data: result.data };
}
