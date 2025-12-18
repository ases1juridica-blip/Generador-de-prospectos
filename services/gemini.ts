
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, GeneratedOutreach } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findProspects = async (
  industry: string,
  location: string,
  painPoints: string[]
): Promise<Lead[]> => {
  const prompt = `
    Actúa como un Auditor de Ventas Senior para JGroupTech.
    Tu misión es encontrar 10 negocios reales de "${industry}" en "${location}" que estén PERDIENDO DINERO debido a mala atención al cliente reflejada en Google Maps.
    
    CRITERIO DE SELECCIÓN: Negocios con más de 10 reseñas donde los usuarios mencionen "no contestan", "espera larga", "mala atención" o "imposible agendar".
    
    PARA CADA NEGOCIO DEBES CALCULAR:
    - estimatedMonthlyLoss: Una estimación conservadora en USD de cuánto dinero pierde el negocio mensualmente por llamadas no contestadas o citas perdidas (ej. 1500, 5000, 10000).
    
    Formato de Salida (JSON ARRAY):
    [
      {
        "name": "Nombre Empresa",
        "category": "${industry}",
        "city": "${location}",
        "address": "Dirección completa",
        "phone": "Teléfono",
        "email": "Email si existe",
        "ownerName": "Nombre del Dueño/Gerente",
        "rating": 2.5,
        "userRatingCount": 40,
        "websiteUri": "url",
        "googleMapsUri": "url",
        "sentimentAnalysis": {
          "score": 92,
          "summary": "Resumen crítico del dolor del cliente",
          "painPoints": ["No contestan", "Mala atención"],
          "estimatedMonthlyLoss": 3500
        }
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        temperature: 0.3,
      },
    });

    let jsonStr = response.text || "[]";
    jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
    const rawLeads = JSON.parse(jsonStr);

    return rawLeads.map((lead: any, index: number) => ({
      ...lead,
      id: `lead-${Date.now()}-${index}`,
      contactStatus: "new"
    }));
  } catch (error) {
    console.error("Error finding prospects:", error);
    throw new Error("Error en la conexión con el satélite de inteligencia.");
  }
};

export const generateColdOutreach = async (lead: Lead): Promise<GeneratedOutreach> => {
  const prompt = `
    Eres Jairo Segura, CEO de JGroupTech Agency. 
    Redacta una propuesta comercial "Imposible de Ignorar" para ${lead.name} dirigida a ${lead.ownerName || 'la Gerencia'}.
    
    DATO CLAVE: Nuestra auditoría estima que están perdiendo $${lead.sentimentAnalysis.estimatedMonthlyLoss} USD mensuales por fallas en su atención al cliente.
    SOLUCIÓN: Agentes de IA que operan 24/7.

    Firma: 
    "Estoy listo para ayudarle a recuperar esos ingresos.
    
    Atentamente,
    Jairo Segura
    CEO, JGroupTech Agency
    Dubái | Miami | Bogotá | La Paz"

    FORMATO JSON:
    {
      "subject": "Asunto magnético mencionando la pérdida financiera",
      "body": "Cuerpo del email persuasivo y profesional",
      "whatsappMessage": "Mensaje de WhatsApp directo al grano con CTA",
      "smsMessage": "SMS recordatorio ultra corto"
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          body: { type: Type.STRING },
          whatsappMessage: { type: Type.STRING },
          smsMessage: { type: Type.STRING }
        },
        required: ["subject", "body", "whatsappMessage", "smsMessage"]
      }
    },
  });

  return JSON.parse(response.text || "{}");
};
