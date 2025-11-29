import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { IMoodService } from "src/_utils/interfaces/mood-service.interface";

@Injectable()
export class MockMoodService implements IMoodService {

  constructor(readonly httpService: HttpService){}

  async fetchWheatherData(lat: number, lng: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get('https://jsonplaceholder.typicode.com/posts')
    )
    return response.data
  }

  async handleApiFailure() {
    return null;
  }
}
