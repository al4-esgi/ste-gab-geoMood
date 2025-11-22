import { Injectable } from "@nestjs/common";
import { IMoodService } from "src/_utils/interfaces/mood-service.interface";

@Injectable()
export class MockMoodService implements IMoodService {}
