import { AvailabilityRule, DayOfWeek } from './availability-rule.entity';

describe('AvailabilityRule Entity', () => {
  describe('DayOfWeek enum', () => {
    it('should have correct enum values', () => {
      expect(DayOfWeek.MONDAY).toBe(1);
      expect(DayOfWeek.TUESDAY).toBe(2);
      expect(DayOfWeek.WEDNESDAY).toBe(3);
      expect(DayOfWeek.THURSDAY).toBe(4);
      expect(DayOfWeek.FRIDAY).toBe(5);
      expect(DayOfWeek.SATURDAY).toBe(6);
      expect(DayOfWeek.SUNDAY).toBe(7);
    });

    it('should have all days of the week', () => {
      const days = Object.values(DayOfWeek).filter(value => typeof value === 'number');
      expect(days).toHaveLength(7);
      expect(days).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe('AvailabilityRule class', () => {
    it('should create an instance with all properties', () => {
      const rule = new AvailabilityRule();
      rule.id = 'rule-123';
      rule.calendarOwnerId = 'owner-123';
      rule.dayOfWeek = DayOfWeek.MONDAY;
      rule.startTime = '09:00:00';
      rule.endTime = '17:00:00';
      rule.isActive = true;
      rule.createdAt = new Date('2023-01-01T00:00:00Z');
      rule.updatedAt = new Date('2023-01-01T00:00:00Z');

      expect(rule.id).toBe('rule-123');
      expect(rule.calendarOwnerId).toBe('owner-123');
      expect(rule.dayOfWeek).toBe(DayOfWeek.MONDAY);
      expect(rule.startTime).toBe('09:00:00');
      expect(rule.endTime).toBe('17:00:00');
      expect(rule.isActive).toBe(true);
      expect(rule.createdAt).toEqual(new Date('2023-01-01T00:00:00Z'));
      expect(rule.updatedAt).toEqual(new Date('2023-01-01T00:00:00Z'));
    });


  });



  describe('Validation scenarios', () => {
    it('should handle valid time formats', () => {
      const rule = new AvailabilityRule();
      rule.startTime = '09:00:00';
      rule.endTime = '17:00:00';

      expect(rule.startTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(rule.endTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('should handle different day of week values', () => {
      const rule = new AvailabilityRule();
      
      rule.dayOfWeek = DayOfWeek.MONDAY;
      expect(rule.dayOfWeek).toBe(1);
      
      rule.dayOfWeek = DayOfWeek.SUNDAY;
      expect(rule.dayOfWeek).toBe(7);
    });

    it('should handle boolean isActive values', () => {
      const rule = new AvailabilityRule();
      
      rule.isActive = true;
      expect(rule.isActive).toBe(true);
      
      rule.isActive = false;
      expect(rule.isActive).toBe(false);
    });
  });


}); 