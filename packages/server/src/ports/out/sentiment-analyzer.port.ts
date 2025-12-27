import { ImageData } from '../../domain/value-objects/image-data.vo'

export interface ISentimentAnalyzerPort {
  getTextSentimentAnalysis(text: string): Promise<number>
  getPictureSentimentAnalysis(picture: ImageData): Promise<number>
}
