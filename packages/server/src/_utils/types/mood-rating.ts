export type AnalysisRating = 0 | 1 | 2 | 3 | 4 | 5
export type Percentage = 0 | 0.1 | 0.2 | 0.25 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1
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
    ratingPhotoAnalysis: AnalysisRating,
    ratingWeather: AnalysisRating,
  ) {
    this.ratingPhotoAnalysis = ratingPhotoAnalysis
    this.ratingUserNumberInput = ratingUserNumberInput
    this.ratingUserTextInput = ratingUserTextInput
    this.ratingWeather = ratingWeather
    this.weight = {
      ratingUserTextInput: 0.25,
      ratingUserNumberInput: 0.25,
      ratingPhotoAnalysis: 0.25,
      ratingWeather: 0.25,
    }
  }

  public setWeight(weight: AnalysisWeight) {
    throw new Error('not implemented')
  }

  public get total(): number {
    throw new Error('not implemented')
  }
}
