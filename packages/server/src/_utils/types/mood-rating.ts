export type AnalysisRating = 0 | 1 | 2 | 3 | 4 | 5
export type Percentage = 0 | 0.1 | 0.2 | 0.25 | 0.3 | 0.33 | 0.34 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1
type PropertiesOnly<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T]
export type AnalysisWeight = Record<Exclude<PropertiesOnly<IMoodRating>, 'weight' | 'total'>, Percentage>
interface IMoodRating {
  readonly ratingUserTextInput: AnalysisRating
  readonly ratingUserNumberInput: AnalysisRating
  readonly ratingPhotoAnalysis: AnalysisRating
  readonly ratingWeather: AnalysisRating
}

export class MoodRating implements IMoodRating {
  readonly ratingUserTextInput: AnalysisRating
  readonly ratingUserNumberInput: AnalysisRating
  readonly ratingPhotoAnalysis: AnalysisRating
  readonly ratingWeather: AnalysisRating
  public weight: AnalysisWeight

  constructor(
    ratingUserTextInput: AnalysisRating,
    ratingUserNumberInput: AnalysisRating,
    ratingWeather: AnalysisRating,
    ratingPhotoAnalysis?: AnalysisRating,
  ) {
    this.ratingPhotoAnalysis = ratingPhotoAnalysis === undefined ? 0 : ratingPhotoAnalysis
    this.ratingUserNumberInput = ratingUserNumberInput
    this.ratingUserTextInput = ratingUserTextInput
    this.ratingWeather = ratingWeather
    if (this.ratingPhotoAnalysis === 0) {
      this.weight = {
        ratingUserTextInput: 0.33,
        ratingUserNumberInput: 0.34,
        ratingPhotoAnalysis: 0,
        ratingWeather: 0.33,
      }
    } else {
      this.weight = {
        ratingUserTextInput: 0.25,
        ratingUserNumberInput: 0.25,
        ratingPhotoAnalysis: 0.25,
        ratingWeather: 0.25,
      }
    }
  }

  public setWeight(weight: AnalysisWeight) {
    this.validateWeights(weight)
    this.weight = weight
  }

  private validateWeights(weight: AnalysisWeight): void {
    const total = Object.values(weight).reduce((sum, w) => sum + Math.round(w * 100), 0)
    console.error(total)
    if (total === 100) return
    if (total > 100) throw new Error('Weight sum must equal 1.0')
    if (total < 100) throw new Error('Weight sum must equal 1.0')
    else throw new Error('invalid weights')
  }

  public get total(): number {
    return (
      this.ratingUserTextInput * this.weight.ratingUserTextInput +
      this.ratingUserNumberInput * this.weight.ratingUserNumberInput +
      this.ratingPhotoAnalysis * this.weight.ratingPhotoAnalysis +
      this.ratingWeather * this.weight.ratingWeather
    )
  }
}
