import { GenerativeModel } from "@google/generative-ai";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { MemoryStoredFile } from "nestjs-form-data";
import {
  GEMINI_PRO_MODEL_TOKEN,
  GEMINI_PROMPT,
  GEMINI_VISION_PROMPT,
  NEGATIVE_KEYWORDS,
  POSITIVE_KEYWORDS,
} from "../../../application/moods/_utils/constants";
import { decodeLlmResponse } from "../../../application/moods/_utils/schemas/llm-response.schema";
import { ISentimentAnalyzerPort } from "../../../ports/out/sentiment-analyzer.port";

@Injectable()
export class SentimentAnalyzerAdapter implements ISentimentAnalyzerPort {
  constructor(
    @Inject(GEMINI_PRO_MODEL_TOKEN)
    private readonly geminiModel: GenerativeModel,
    private readonly logger: Logger
  ) {}

  async getTextSentimentAnalysis(text: string): Promise<number> {
    try {
      const prompt = GEMINI_PROMPT + text;
      const result = await this.geminiModel.generateContent(prompt);
      const response = result.response.text();
      const llmResponse = decodeLlmResponse(response);
      return llmResponse.score;
    } catch (e) {
      this.logger.error(
        "Text sentiment analysis failed, using keyword fallback",
        e
      );
      return this.handleLlmFailure(text);
    }
  }

  async getPictureSentimentAnalysis(
    picture: MemoryStoredFile
  ): Promise<number> {
    try {
      const result = await this.geminiModel.generateContent([
        GEMINI_VISION_PROMPT,
        {
          inlineData: {
            mimeType: picture.mimeType,
            data: picture.buffer.toString("base64"),
          },
        },
      ]);

      const response = result.response.text();
      const llmResponse = decodeLlmResponse(response);

      if (llmResponse.score < 1 || llmResponse.score > 5) {
        this.logger.error(
          `Vision API returned out-of-bounds score: ${llmResponse.score}`
        );
        return 3;
      }

      return llmResponse.score;
    } catch (e) {
      this.logger.error(
        "Vision API sentiment analysis failed, returning neutral score",
        e
      );
      return 3;
    }
  }

  private handleLlmFailure(userInput: string): number {
    const normalizedText = userInput
      .toLowerCase()
      .replace(/[.,!?;:'"""()]/g, " ");
    const words = normalizedText.split(" ");

    let positiveCount = 0;
    let negativeCount = 0;
    for (const word of words) {
      if (POSITIVE_KEYWORDS.has(word)) positiveCount++;
      if (NEGATIVE_KEYWORDS.has(word)) negativeCount++;
    }

    const totalKeywords = positiveCount + negativeCount;

    if (totalKeywords === 0) {
      return 3;
    }
    const positiveRatio = positiveCount / totalKeywords;
    const score = Math.round(1 + positiveRatio * 4);

    return Math.max(1, Math.min(5, score));
  }
}
