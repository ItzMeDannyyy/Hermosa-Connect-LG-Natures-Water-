/**
 * ============================================================================
 * FILE: src/services/geminiVisionService.ts
 * PURPOSE: AI Photo Container & Gallon Counting Service for LG Nature's Water
 *          Mobile App.
 *          - Connects to Google Gemini Multimodal Vision API using the
 *            environment-configured AI Studio Service Auth Key (EXPO_PUBLIC_GEMINI_API_KEY).
 *          - Processes captured load photos and returns structured gallon counts,
 *            confidence rating, and detection summary.
 * ============================================================================
 */

export interface GeminiGallonCountResult {
  detectedCount: number;
  confidence: number;
  containerType: string;
  notes: string;
}

/**
 * Returns the active Gemini API key from mobile/.env (EXPO_PUBLIC_GEMINI_API_KEY).
 * Throws a descriptive configuration error if the key is not defined.
 */
export function getGeminiApiKey(): string {
  const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (typeof envKey === 'string' && envKey.trim().length > 0) {
    return envKey.trim();
  }

  throw new Error(
    'Gemini Vision API key is not configured. Please define EXPO_PUBLIC_GEMINI_API_KEY in mobile/.env.',
  );
}

/**
 * Prompt instruction for Gemini Vision to count water jugs/gallons
 */
const GALLON_COUNTING_SYSTEM_PROMPT = `
You are an expert automated visual auditor for LG Nature's Water refilling station.
Your task is to carefully analyze this captured delivery load photo and count the total number of water containers (5-gallon slim containers, round blue gallon bottles, or carboys).

Guidelines:
1. Count each visible water gallon/container accurately, even if partially occluded, stacked, or lined up.
2. If there are no water containers or the image is unrelated, return detectedCount: 0 with an explanation note.
3. Respond ONLY with a valid JSON object matching this exact schema:
{
  "detectedCount": <integer >= 0>,
  "confidence": <integer between 50 and 100>,
  "containerType": "5-Gallon Slim Container (Refill)",
  "notes": "<short 1-sentence description of counted containers>"
}
`;

/**
 * Calls Gemini Vision API with base64 image data to count water containers
 */
export async function countGallonsFromPhotoBase64(
  base64Data: string,
  mimeType: string = 'image/jpeg',
): Promise<GeminiGallonCountResult> {
  const apiKey = getGeminiApiKey();

  // Clean base64 string if it contains data URI prefix
  let cleanBase64 = base64Data;
  if (cleanBase64.includes('base64,')) {
    const parts = cleanBase64.split('base64,');
    cleanBase64 = parts[1] ?? cleanBase64;
  }

  // List of Gemini models to try in order of capability & availability
  const candidateModels = [
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];

  let lastErrorMessage = '';

  for (let index = 0; index < candidateModels.length; index = index + 1) {
    const modelName = candidateModels[index];
    const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const requestPayload = {
      contents: [
        {
          parts: [
            {
              text: GALLON_COUNTING_SYSTEM_PROMPT,
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        lastErrorMessage = `Model ${modelName} returned status ${response.status}: ${errorText}`;
        console.warn(`[GeminiVision] ${lastErrorMessage}`);
        continue;
      }

      const responseJson = (await response.json()) as {
        candidates?: {
          content?: {
            parts?: {
              text?: string;
            }[];
          };
        }[];
      };

      const rawText =
        responseJson.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

      // Parse JSON from text response
      const parsedData = JSON.parse(rawText) as Partial<GeminiGallonCountResult>;

      const detectedCount =
        typeof parsedData.detectedCount === 'number' &&
        !isNaN(parsedData.detectedCount)
          ? Math.max(0, Math.round(parsedData.detectedCount))
          : 0;

      const confidence =
        typeof parsedData.confidence === 'number' &&
        !isNaN(parsedData.confidence)
          ? Math.min(100, Math.max(1, Math.round(parsedData.confidence)))
          : 95;

      const containerType =
        typeof parsedData.containerType === 'string' &&
        parsedData.containerType.length > 0
          ? parsedData.containerType
          : '5-Gallon Slim Container (Refill)';

      const notes =
        typeof parsedData.notes === 'string' && parsedData.notes.length > 0
          ? parsedData.notes
          : `${detectedCount} containers detected.`;

      return {
        detectedCount: detectedCount,
        confidence: confidence,
        containerType: containerType,
        notes: notes,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const errString = err instanceof Error ? err.message : String(err);
      lastErrorMessage = `Model ${modelName} call failed: ${errString}`;
      console.warn(`[GeminiVision] ${lastErrorMessage}`);
    }
  }

  throw new Error(
    `Failed to analyze gallon count with Gemini Vision AI. ${lastErrorMessage}`,
  );
}
