import { validate } from 'class-validator';
import { CreateAvailabilityRuleDto } from './create-availability-rule.dto';
import { DayOfWeek } from '../entities/availability-rule.entity';

describe('CreateAvailabilityRuleDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new CreateAvailabilityRuleDto();
      dto.dayOfWeek = DayOfWeek.MONDAY;
      dto.startTime = '09:00:00';
      dto.endTime = '17:00:00';
      dto.isActive = true;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when dayOfWeek is missing', async () => {
      const dto = new CreateAvailabilityRuleDto();
      dto.startTime = '09:00:00';
      dto.endTime = '17:00:00';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail validation when startTime is missing', async () => {
      const dto = new CreateAvailabilityRuleDto();
      dto.dayOfWeek = DayOfWeek.MONDAY;
      dto.endTime = '17:00:00';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when endTime is missing', async () => {
      const dto = new CreateAvailabilityRuleDto();
      dto.dayOfWeek = DayOfWeek.MONDAY;
      dto.startTime = '09:00:00';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });



    it('should pass validation when isActive is not provided (optional field)', async () => {
      const dto = new CreateAvailabilityRuleDto();
      dto.dayOfWeek = DayOfWeek.MONDAY;
      dto.startTime = '09:00:00';
      dto.endTime = '17:00:00';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with all valid day of week values', async () => {
      const validDays = [
        DayOfWeek.MONDAY,
        DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY,
        DayOfWeek.FRIDAY,
        DayOfWeek.SATURDAY,
        DayOfWeek.SUNDAY,
      ];

      for (const day of validDays) {
        const dto = new CreateAvailabilityRuleDto();
        dto.dayOfWeek = day;
        dto.startTime = '09:00:00';
        dto.endTime = '17:00:00';

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should fail validation with invalid day of week value', async () => {
      const dto = new CreateAvailabilityRuleDto();
      dto.dayOfWeek = 8 as DayOfWeek; // Invalid value
      dto.startTime = '09:00:00';
      dto.endTime = '17:00:00';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });


}); 