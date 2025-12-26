import { MemoryStoredFile } from "nestjs-form-data"

export interface IGeminiPort {
	getTextSentimentAnalysis(text: string) : Promise<number>
	getPictureSentimentAnalysis(picture: MemoryStoredFile) : Promise<number>
}
