import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./schemas/user.schema";
import { Mood } from "./schemas/mood.schema";

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(name: string, email: string): Promise<UserDocument> {
    const user = new this.userModel({ name, email, moods: [] });
    return user.save();
  }

  async findUserById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async addMoodToUser(userId: string, mood: Mood): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $push: { moods: mood } },
        { new: true }
      )
      .exec();
  }

  async getUserMoods(userId: string): Promise<Mood[]> {
    const user = await this.userModel.findById(userId).exec();
    return user?.moods || [];
  }

  async getMoodsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Mood[]> {
    const user = await this.userModel
      .findById(userId)
      .select({
        moods: {
          $elemMatch: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
      })
      .exec();
    return user?.moods || [];
  }

  async getMoodById(userId: string, moodId: string): Promise<Mood | null> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return null;
    return user.moods.find((m: any) => m._id?.toString() === moodId) || null;
  }

  async updateMood(
    userId: string,
    moodId: string,
    updates: Partial<Mood>
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate(
        { _id: userId, "moods._id": moodId },
        {
          $set: {
            "moods.$.textContent": updates.textContent,
            "moods.$.rating": updates.rating,
            "moods.$.updatedAt": new Date(),
          },
        },
        { new: true }
      )
      .exec();
  }

  async deleteMood(userId: string, moodId: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { moods: { _id: moodId } } },
        { new: true }
      )
      .exec();
  }

  async checkDuplicateMoodInHour(userId: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const user = await this.userModel.findById(userId).exec();
    if (!user) return false;

    return user.moods.some(
      (mood: any) => mood.createdAt && mood.createdAt > oneHourAgo
    );
  }

  async deleteUser(userId: string): Promise<void> {
    await this.userModel.findByIdAndDelete(userId).exec();
  }
}
