import { openai } from "@ai-sdk/openai";
import { customProvider } from "ai";

export const myProvider = customProvider({
  languageModels: {
    "gpt-4o": openai("gpt-4o"),
  },
});

export type modelID = Parameters<(typeof myProvider)["languageModel"]>["0"];

export const models: Record<modelID, string> = {
  "gpt-4o": "GPT-4o",
};
