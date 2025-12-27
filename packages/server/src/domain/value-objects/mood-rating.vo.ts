export type AnalysisRating = 0 | 1 | 2 | 3 | 4 | 5

type Weight = {
  ratingUserTextInput: number
  ratingUserNumberInput: number
  ratingPhotoAnalysis: number
  ratingWeather: number
}

export class MoodRating {
  readonly ratingUserTextInput: AnalysisRating
  readonly ratingUserNumberInput: AnalysisRating
  readonly ratingPhotoAnalysis: AnalysisRating
  readonly ratingWeather: AnalysisRating
  weight: Weight

  constructor(
    ratingUserTextInput: AnalysisRating,
    ratingUserNumberInput: AnalysisRating,
    ratingWeather: AnalysisRating,
    ratingPhotoAnalysis?: AnalysisRating,
  ) {
    this.ratingPhotoAnalysis = ratingPhotoAnalysis ?? 0
    this.ratingUserNumberInput = ratingUserNumberInput
    this.ratingUserTextInput = ratingUserTextInput
    this.ratingWeather = ratingWeather

    this.weight = ratingPhotoAnalysis
      ? {
          ratingUserTextInput: 0.25,
          ratingUserNumberInput: 0.25,
          ratingPhotoAnalysis: 0.25,
          ratingWeather: 0.25,
        }
      : {
          ratingUserTextInput: 0.33,
          ratingUserNumberInput: 0.34,
          ratingPhotoAnalysis: 0,
          ratingWeather: 0.33,
        }

    this.validateWeights(this.weight)
  }

  setWeight(newWeight: Weight): void {
    this.validateWeights(newWeight)
    this.weight = newWeight
  }

  private validateWeights(weight: Weight): void {
    const total = Object.values(weight).reduce((sum, w) => sum + Math.round(w * 100), 0)
    if (total === 100) return
    if (total > 100) throw new Error('Weight sum must equal 1.0')
    if (total < 100) throw new Error('Weight sum must equal 1.0')
    else throw new Error('invalid weights')
  }

  get total(): number {
    return (
      this.ratingUserTextInput * this.weight.ratingUserTextInput +
      this.ratingUserNumberInput * this.weight.ratingUserNumberInput +
      this.ratingPhotoAnalysis * this.weight.ratingPhotoAnalysis +
      this.ratingWeather * this.weight.ratingWeather
    )
  }
}
