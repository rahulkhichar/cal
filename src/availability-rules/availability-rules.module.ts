import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityRulesService } from './availability-rules.service';
import { AvailabilityRulesController } from './availability-rules.controller';
import { AvailabilityRule } from './entities/availability-rule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AvailabilityRule])],
  controllers: [AvailabilityRulesController],
  providers: [AvailabilityRulesService],
  exports: [AvailabilityRulesService],
})
export class AvailabilityRulesModule {} 