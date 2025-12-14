import { Schema } from 'effect'

const LlmResponse = Schema.Struct({
  score: Schema.Number,
})

export type LlmResponse = Schema.Schema.Type<typeof LlmResponse>

export const decodeLlmResponse = Schema.decodeUnknownSync(Schema.compose(Schema.parseJson(), LlmResponse))
