export interface MoodRepositoryPort extends RepositoryPort<MoodEntity> {
  deleteMood(userId: string, moodId: string): Promise<MoodEntity | null>
  getMoodsByDateRange(startDate: Date, endDate: Date): Promise<MoodEntity[]>
  getMoodById(userId: string, moodId: string): Promise<MoodEntity | null>
  updateMood(userId: string, moodId: string, updates: Partial<MoodEntity>): Promise<MoodEntity | null>
}
