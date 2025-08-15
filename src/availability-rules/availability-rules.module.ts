import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityRulesController } from './controller/availability-rules.controller';
import { AvailabilityRule } from './entities/availability-rule.entity';
import { AvailabilityRulesService } from './service/availability-rules.service';

@Module({
  imports: [TypeOrmModule.forFeature([AvailabilityRule])],
  controllers: [AvailabilityRulesController],
  providers: [AvailabilityRulesService],
  exports: [AvailabilityRulesService],
})
export class AvailabilityRulesModule {} 