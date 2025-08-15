import { validate } from 'class-validator';
import { UpdateAvailabilityRuleDto } from './update-availability-rule.dto';
import { DayOfWeek } from '../entities/availability-rule.entity';

describe('UpdateAvailabilityRuleDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new UpdateAvailabilityRuleDto();
      dto.dayOfWeek = DayOfWeek.MONDAY;
      dto.startTime = '09:00:00';
      dto.endTime = '17:00:00';
      dto.isActive = true;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with partial data (all fields optional)', async () => {
      const dto = new UpdateAvailabilityRuleDto();
      dto.startTime = '10:00:00';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty object', async () => {
      const dto = new UpdateAvailabilityRuleDto();

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when dayOfWeek is invalid', async () => {
      const dto = new UpdateAvailabilityRuleDto();
      dto.dayOfWeek = 8 as DayOfWeek; // Invalid value

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });



    it('should pass validation with valid day of week values', async () => {
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
        const dto = new UpdateAvailabilityRuleDto();
        dto.dayOfWeek = day;

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should pass validation with boolean isActive values', async () => {
      const dto1 = new UpdateAvailabilityRuleDto();
      dto1.isActive = true;

      const dto2 = new UpdateAvailabilityRuleDto();
      dto2.isActive = false;

      const errors1 = await validate(dto1);
      const errors2 = await validate(dto2);

      expect(errors1).toHaveLength(0);
      expect(errors2).toHaveLength(0);
    });
  });



  describe('partial updates', () => {
    it('should allow updating only startTime', async () => {
      const dto = new UpdateAvailabilityRuleDto();
      dto.startTime = '10:00:00';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should allow updating only endTime', async () => {
      const dto = new UpdateAvailabilityRuleDto();
      dto.endTime = '18:00:00';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should allow updating only dayOfWeek', async () => {
      const dto = new UpdateAvailabilityRuleDto();
      dto.dayOfWeek = DayOfWeek.TUESDAY;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should allow updating only isActive', async () => {
      const dto = new UpdateAvailabilityRuleDto();
      dto.isActive = false;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should allow updating multiple fields', async () => {
      const dto = new UpdateAvailabilityRuleDto();
      dto.startTime = '10:00:00';
      dto.endTime = '18:00:00';
      dto.isActive = false;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
}); 