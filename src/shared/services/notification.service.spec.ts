import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNotifications', () => {
    it('should return observable of notifications', (done) => {
      service.getNotifications().subscribe((notifications) => {
        expect(Array.isArray(notifications)).toBe(true);
        expect(notifications.length).toBe(0);
        done();
      });
    });
  });

  describe('showSuccess', () => {
    it('should add success notification', (done) => {
      service.showSuccess('Success Title', 'Success message');

      service.getNotifications().subscribe((notifications) => {
        expect(notifications.length).toBe(1);
        expect(notifications[0].type).toBe('success');
        expect(notifications[0].title).toBe('Success Title');
        expect(notifications[0].message).toBe('Success message');
        expect(notifications[0].duration).toBe(5000);
        done();
      });
    });

    it('should add success notification with custom duration', (done) => {
      service.showSuccess('Success Title', 'Success message', 3000);

      service.getNotifications().subscribe((notifications) => {
        expect(notifications[0].duration).toBe(3000);
        done();
      });
    });
  });

  describe('showError', () => {
    it('should add error notification', (done) => {
      service.showError('Error Title', 'Error message');

      service.getNotifications().subscribe((notifications) => {
        expect(notifications.length).toBe(1);
        expect(notifications[0].type).toBe('error');
        expect(notifications[0].title).toBe('Error Title');
        expect(notifications[0].message).toBe('Error message');
        expect(notifications[0].duration).toBe(8000);
        done();
      });
    });
  });

  describe('showWarning', () => {
    it('should add warning notification', (done) => {
      service.showWarning('Warning Title', 'Warning message');

      service.getNotifications().subscribe((notifications) => {
        expect(notifications.length).toBe(1);
        expect(notifications[0].type).toBe('warning');
        expect(notifications[0].title).toBe('Warning Title');
        expect(notifications[0].message).toBe('Warning message');
        expect(notifications[0].duration).toBe(6000);
        done();
      });
    });
  });

  describe('showInfo', () => {
    it('should add info notification', (done) => {
      service.showInfo('Info Title', 'Info message');

      service.getNotifications().subscribe((notifications) => {
        expect(notifications.length).toBe(1);
        expect(notifications[0].type).toBe('info');
        expect(notifications[0].title).toBe('Info Title');
        expect(notifications[0].message).toBe('Info message');
        expect(notifications[0].duration).toBe(5000);
        done();
      });
    });
  });

  describe('removeNotification', () => {
    it('should remove notification by id', (done) => {
      service.showSuccess('Test', 'Test message');

      service.getNotifications().subscribe((notifications) => {
        if (notifications.length === 1) {
          const notificationId = notifications[0].id;
          service.removeNotification(notificationId);
        } else if (notifications.length === 0) {
          expect(notifications.length).toBe(0);
          done();
        }
      });
    });

    it('should not affect other notifications when removing one', (done) => {
      service.showSuccess('First', 'First message');
      service.showError('Second', 'Second message');

      service.getNotifications().subscribe((notifications) => {
        if (notifications.length === 2) {
          const firstId = notifications[0].id;
          service.removeNotification(firstId);
        } else if (notifications.length === 1) {
          expect(notifications[0].title).toBe('Second');
          done();
        }
      });
    });
  });

  describe('clearAll', () => {
    it('should remove all notifications', (done) => {
      service.showSuccess('First', 'First message');
      service.showError('Second', 'Second message');
      service.showWarning('Third', 'Third message');

      service.getNotifications().subscribe((notifications) => {
        if (notifications.length === 3) {
          service.clearAll();
        } else if (notifications.length === 0) {
          expect(notifications.length).toBe(0);
          done();
        }
      });
    });
  });

  describe('auto-removal', () => {
    it('should auto-remove notification after duration', (done) => {
      service.showSuccess('Test', 'Test message', 100); // Short duration for test

      let notificationCount = 0;
      service.getNotifications().subscribe((notifications) => {
        notificationCount++;
        if (notificationCount === 1) {
          expect(notifications.length).toBe(1);
        } else if (notificationCount === 2) {
          // Should be removed after timeout
          expect(notifications.length).toBe(0);
          done();
        }
      });
    });

    it('should not auto-remove notification with no duration', () => {
      service.showSuccess('Test', 'Test message', 0);

      service.getNotifications().subscribe((notifications) => {
        expect(notifications.length).toBe(1);
        // Verify the notification has no duration set
        expect(notifications[0].duration).toBe(0);
      });
    });
  });

  describe('notification properties', () => {
    it('should generate unique ids for notifications', (done) => {
      service.showSuccess('First', 'First message');
      service.showSuccess('Second', 'Second message');

      service.getNotifications().subscribe((notifications) => {
        if (notifications.length === 2) {
          expect(notifications[0].id).not.toBe(notifications[1].id);
          done();
        }
      });
    });

    it('should set timestamp for notifications', (done) => {
      const beforeTime = new Date();
      service.showSuccess('Test', 'Test message');

      service.getNotifications().subscribe((notifications) => {
        if (notifications.length === 1) {
          const afterTime = new Date();
          expect(notifications[0].timestamp.getTime()).toBeGreaterThanOrEqual(
            beforeTime.getTime(),
          );
          expect(notifications[0].timestamp.getTime()).toBeLessThanOrEqual(
            afterTime.getTime(),
          );
          done();
        }
      });
    });
  });
});
