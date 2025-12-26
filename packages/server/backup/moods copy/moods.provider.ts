import { GoogleGenerativeAI } from '@google/generative-ai'
import { Provider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GeminiConfig } from '../_utils/config/env.config'
import { GEMINI_CLIENT_TOKEN, GEMINI_PRO_MODEL_TOKEN } from './_utils/constants'

export const moodsProviders: Provider[] = [
  {
    provide: GEMINI_CLIENT_TOKEN,
    useFactory: (configService: ConfigService) => {
      const apiKey = configService.get<GeminiConfig>('GEMINI').GEMINI_API_KEY
      const genAI = new GoogleGenerativeAI(apiKey)
      return genAI
    },
    inject: [ConfigService],
  },
  {
    provide: GEMINI_PRO_MODEL_TOKEN,
    useFactory: (geminiClient: GoogleGenerativeAI) => {
      return geminiClient.getGenerativeModel({ model: 'gemini-pro-latest' })
    },
    inject: [GEMINI_CLIENT_TOKEN],
  },
]
