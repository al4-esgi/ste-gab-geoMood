import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FormDataRequest } from 'nestjs-form-data'
import { CreateMoodUseCase } from '../../application/create-mood'
import { GetMoodsUseCase } from '../../application/get-mood.usecase'
import { CreateMoodDto } from '../dto/request/create-mood.dto'

@ApiTags('Moods')
@Controller('moods')
export class MoodsController {
  constructor(
    private readonly createMoodUseCase: CreateMoodUseCase,
    private readonly getMoodsUseCase: GetMoodsUseCase,
  ) {}

  @Post()
  @FormDataRequest()
  @ApiOperation({ summary: 'Create a new mood entry' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateMoodDto })
  async createMood(@Body() body: CreateMoodDto) {
    return await this.createMoodUseCase.createMood(body)
  }

  @Get()
  @ApiOperation({ summary: "Get today's moods" })
  @ApiResponse({ status: 200, description: 'Returns all moods from today' })
  async getMoods() {
    const moods = await this.getMoodsUseCase.getTodaysMoods()
    return { moods }
  }
}
