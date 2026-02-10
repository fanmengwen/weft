import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedFlowData } from '../types';

export const generateDiagramFromPrompt = async (
  prompt: string,
  currentNodesJSON: string,
  focusedContextJSON?: string
): Promise<GeneratedFlowData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are an expert system architect and UI designer specializing in creating technical flowcharts and diagrams.
    Your goal is to generate a structured JSON representation of a flowchart based on the user's description.

    LAYOUT RULES:
    1. You MUST calculate 'x' and 'y' coordinates for every node. 
    2. Organize the flow logically, typically from Top-to-Bottom.
    3. 'x' should generally be centered around 0. Branch out horizontally for decisions.
    4. 'y' should increase by approximately 150-200 pixels for each step down.
    5. Avoid overlapping nodes.
    
    NODE TYPES:
    - 'start': Use for entry points.
    - 'process': Use for actions, functions, or states.
    - 'decision': Use for logic branches (if/else).
    - 'end': Use for exit points.

    If the user asks to "update" or "add" to an existing flow, I will provide the current flow JSON. Respect existing IDs where possible but feel free to reposition nodes for better layout.
    If 'Focused Context' is provided, the user wants you to specifically modify, expand, or connect to those nodes, while keeping the rest of the flow in mind.
  `;

  const fullPrompt = `
    User Request: ${prompt}
    ${currentNodesJSON ? `Current Diagram State: ${currentNodesJSON}` : ''}
    ${focusedContextJSON ? `Focused Context (Selected Nodes): ${focusedContextJSON}` : ''}
    
    Generate the nodes and edges for this flow.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: fullPrompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['start', 'process', 'decision', 'end'] },
                label: { type: Type.STRING },
                description: { type: Type.STRING },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
              },
              required: ['id', 'type', 'label', 'x', 'y']
            }
          },
          edges: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                source: { type: Type.STRING },
                target: { type: Type.STRING },
                label: { type: Type.STRING },
              },
              required: ['id', 'source', 'target']
            }
          }
        },
        required: ['nodes', 'edges']
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text) as GeneratedFlowData;
};