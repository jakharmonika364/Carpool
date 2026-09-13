import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { RedisService } from './redis/redis.service';

@ApiExcludeController()
@Controller({ path: 'health', version: '1' })
export class AppController {
  constructor(private readonly redisService: RedisService) {}

  @Get()
  async check(): Promise<{ status: string; redis: boolean }> {
    const redis = await this.redisService.ping();
    return { status: 'ok', redis };
  }
}
