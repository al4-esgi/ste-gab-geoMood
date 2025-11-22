import { Injectable } from "@nestjs/common";
import { IMoodService } from "src/_utils/interfaces/mood-service.interface";

@Injectable()
export class MockMoodService implements IMoodService {
  async fetchWheatherData(lat: number, lng: number): Promise<any> {
    return Promise.reject("Method not implemented.");
  }

  async handleApiFailure() {
    return null;
  }
}
