import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start with loading false', () => {
      expect(service.isLoading).toBe(false);
    });

    it('should emit false initially', (done) => {
      service.isLoading$.subscribe((loading) => {
        expect(loading).toBe(false);
        done();
      });
    });
  });

  describe('setLoading', () => {
    it('should set loading to true when adding a key', (done) => {
      service.setLoading('test-key', true);

      service.isLoading$.subscribe((loading) => {
        expect(loading).toBe(true);
        expect(service.isLoading).toBe(true);
        done();
      });
    });

    it('should set loading to false when removing the last key', (done) => {
      service.setLoading('test-key', true);

      let emissionCount = 0;
      service.isLoading$.subscribe((loading) => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(loading).toBe(true);
          service.setLoading('test-key', false);
        } else if (emissionCount === 2) {
          expect(loading).toBe(false);
          expect(service.isLoading).toBe(false);
          done();
        }
      });
    });

    it('should keep loading true when multiple keys are active', (done) => {
      service.setLoading('key1', true);
      service.setLoading('key2', true);

      let emissionCount = 0;
      service.isLoading$.subscribe((loading) => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(loading).toBe(true);
          service.setLoading('key1', false);
        } else if (emissionCount === 2) {
          expect(loading).toBe(true); // Still true because key2 is active
          done();
        }
      });
    });
  });

  describe('startLoading', () => {
    it('should start loading for a key', (done) => {
      service.startLoading('test-key');

      service.isLoading$.subscribe((loading) => {
        expect(loading).toBe(true);
        expect(service.isLoadingKey('test-key')).toBe(true);
        done();
      });
    });
  });

  describe('stopLoading', () => {
    it('should stop loading for a key', (done) => {
      service.startLoading('test-key');

      let emissionCount = 0;
      service.isLoading$.subscribe((loading) => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(loading).toBe(true);
          service.stopLoading('test-key');
        } else if (emissionCount === 2) {
          expect(loading).toBe(false);
          expect(service.isLoadingKey('test-key')).toBe(false);
          done();
        }
      });
    });
  });

  describe('stopAllLoading', () => {
    it('should stop all loading states', (done) => {
      service.startLoading('key1');
      service.startLoading('key2');
      service.startLoading('key3');

      let emissionCount = 0;
      service.isLoading$.subscribe((loading) => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(loading).toBe(true);
          service.stopAllLoading();
        } else if (emissionCount === 2) {
          expect(loading).toBe(false);
          expect(service.isLoadingKey('key1')).toBe(false);
          expect(service.isLoadingKey('key2')).toBe(false);
          expect(service.isLoadingKey('key3')).toBe(false);
          done();
        }
      });
    });
  });

  describe('isLoadingKey', () => {
    it('should return true for active loading key', () => {
      service.startLoading('test-key');
      expect(service.isLoadingKey('test-key')).toBe(true);
    });

    it('should return false for inactive loading key', () => {
      expect(service.isLoadingKey('test-key')).toBe(false);
    });

    it('should return false after stopping loading', () => {
      service.startLoading('test-key');
      service.stopLoading('test-key');
      expect(service.isLoadingKey('test-key')).toBe(false);
    });
  });

  describe('getActiveLoadingKeys', () => {
    it('should return empty array when no loading states', () => {
      expect(service.getActiveLoadingKeys()).toEqual([]);
    });

    it('should return array of active loading keys', () => {
      service.startLoading('key1');
      service.startLoading('key2');

      const activeKeys = service.getActiveLoadingKeys();
      expect(activeKeys).toContain('key1');
      expect(activeKeys).toContain('key2');
      expect(activeKeys.length).toBe(2);
    });

    it('should update when keys are removed', () => {
      service.startLoading('key1');
      service.startLoading('key2');
      service.stopLoading('key1');

      const activeKeys = service.getActiveLoadingKeys();
      expect(activeKeys).toContain('key2');
      expect(activeKeys).not.toContain('key1');
      expect(activeKeys.length).toBe(1);
    });
  });

  describe('multiple operations', () => {
    it('should handle rapid start/stop operations', (done) => {
      service.startLoading('key1');
      service.startLoading('key2');
      service.stopLoading('key1');
      service.startLoading('key3');
      service.stopLoading('key2');
      service.stopLoading('key3');

      service.isLoading$.subscribe((loading) => {
        expect(loading).toBe(false);
        expect(service.getActiveLoadingKeys().length).toBe(0);
        done();
      });
    });

    it('should handle same key multiple times', () => {
      service.startLoading('test-key');
      service.startLoading('test-key'); // Should not create duplicate

      expect(service.getActiveLoadingKeys().length).toBe(1);
      expect(service.isLoadingKey('test-key')).toBe(true);

      service.stopLoading('test-key');
      expect(service.isLoadingKey('test-key')).toBe(false);
    });
  });
});
