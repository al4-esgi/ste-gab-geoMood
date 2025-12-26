import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FormDataRequest } from 'nestjs-form-data'
import { MoodsService } from '../../application/moods.service'
import { CreateMoodDto } from '../../application/moods/_utils/dto/request/create-mood.dto'

@ApiTags('Moods')
@Controller('moods')
export class MoodsController {
  constructor(private readonly moodsService: MoodsService) {}

  @Post()
  @FormDataRequest()
  @ApiOperation({ summary: 'Create a new mood entry' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateMoodDto })
  async createMood(@Body() body: CreateMoodDto) {
    return await this.moodsService.createMood(body)
  }

  @Get()
  @ApiOperation({ summary: "Get today's moods" })
  @ApiResponse({ status: 200, description: 'Returns all moods from today' })
  async getMoods() {
    const users = await this.moodsService.getTodaysMoods()
    const moods = users.flatMap((user) => user.moods)
    return { moods }
  }
}
