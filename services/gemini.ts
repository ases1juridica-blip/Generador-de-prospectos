import { GoogleGenAI } from "@google/genai";
import { Lead, GeneratedEmail } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findProspects = async (
  industry: string,
  location: string,
  painPoints: string[]
): Promise<Lead[]> => {
  const prompt = `
    Actúa como un experto investigador de leads B2B para la agencia "JGroupTech".
    
    Objetivo: Encontrar 5-10 negocios del tipo "${industry}" en "${location}".
    
    Criterios de Búsqueda:
    1. Prioridad: Negocios con reseñas en Google Maps o menciones en redes sociales sobre mala atención telefónica, servicio lento o que no contestan.
    2. IMPORTANTE: Intenta extraer información de contacto si está visible públicamente (Teléfono, Web, y si es posible inferir un nombre de contacto o email de la descripción).
    
    Puntos de dolor a buscar:
    ${painPoints.map((p) => `- ${p}`).join("\n")}
    
    Formato de Salida (JSON ARRAY EXACTO):
    Devuelve SOLAMENTE un array JSON.
    Estructura requerida:
    [
      {
        "name": "Nombre del Negocio",
        "category": "${industry}",
        "city": "${location}",
        "address": "Dirección completa",
        "phone": "Número de teléfono (si hay)",
        "email": "Email (si se encuentra en web/snippet, sino null)",
        "ownerName": "Nombre del dueño (si se menciona en reviews/web, sino 'Gerente General')",
        "managerName": "Nombre del encargado (si se menciona, sino null)",
        "rating": 3.5,
        "userRatingCount": 100,
        "websiteUri": "url web",
        "googleMapsUri": "url maps",
        "sentimentAnalysis": {
          "score": 85,
          "summary": "Resumen del problema (ej: Clientes se quejan de que nunca contestan).",
          "painPoints": ["no contestan", "espera larga"]
        }
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        // Habilitamos Google Maps y Google Search para mayor cobertura (redes sociales, web, etc)
        tools: [{ googleMaps: {}, googleSearch: {} }],
        temperature: 0.4,
      },
    });

    let jsonStr = response.text || "[]";
    jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();

    const rawLeads = JSON.parse(jsonStr);

    return rawLeads.map((lead: any, index: number) => ({
      ...lead,
      id: `lead-${Date.now()}-${index}`,
      contactStatus: "new",
      // Fallbacks to ensure valid CSV data
      ownerName: lead.ownerName || "Gerente Comercial",
      city: location,
      category: industry
    }));
  } catch (error) {
    console.error("Error finding prospects:", error);
    throw new Error("No se pudieron obtener prospectos. Intenta ser más específico con la ubicación.");
  }
};

export const generateColdOutreach = async (
  lead: Lead,
  myAgencyName: string,
  myAgencyUrl: string
): Promise<GeneratedEmail> => {
  const prompt = `
    Escribe un correo electrónico de venta en frío altamente personalizado para:
    Negocio: "${lead.name}"
    Contacto: "${lead.ownerName || 'Gerente'}"
    
    Contexto:
    Soy una agencia de IA llamada "${myAgencyName}" (${myAgencyUrl}).
    Ofrecemos Agentes de IA para resolver: "${lead.sentimentAnalysis.summary}".
    
    Instrucciones:
    - Usa un tono profesional.
    - El objetivo es agendar una demo.
    
    Salida JSON:
    {
      "subject": "Asunto del correo",
      "body": "Cuerpo del correo"
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text);
};