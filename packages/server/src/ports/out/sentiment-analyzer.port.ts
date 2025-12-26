import { MemoryStoredFile } from "nestjs-form-data";

export interface ISentimentAnalyzerPort {
  getTextSentimentAnalysis(text: string): Promise<number>;
  getPictureSentimentAnalysis(picture: MemoryStoredFile): Promise<number>;
}
