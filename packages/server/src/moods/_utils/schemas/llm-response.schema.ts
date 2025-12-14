import { Schema } from 'effect'

const LlmResponse = Schema.Struct({
  score: Schema.Number.pipe(Schema.between(1, 5)),
})

export type LlmResponse = Schema.Schema.Type<typeof LlmResponse>

export const decodeLlmResponse = Schema.decodeUnknownSync(Schema.compose(Schema.parseJson(), LlmResponse))
