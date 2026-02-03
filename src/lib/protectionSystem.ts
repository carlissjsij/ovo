import { fingerprint } from './fingerprint';
import { botDetector, type BotDetectionResult } from './botDetector';
import { supabase } from './supabase';

export interface ProtectionResult {
  allowed: boolean;
  fingerprint: string;
  reason?: string;
  detectionResult?: BotDetectionResult;
}

export class ProtectionSystem {
  private fingerprintCache: string | null = null;

  async initialize(): Promise<ProtectionResult> {
    try {
      const fp = await Promise.race([
        fingerprint.get(),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('Fingerprint timeout')), 2000)
        )
      ]);

      this.fingerprintCache = fp;

      const isBlocked = await Promise.race([
        this.checkIfBlocked(fp),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1000))
      ]);

      if (isBlocked) {
        this.logAccess(fp, true, 'previously-blocked').catch(console.error);
        return {
          allowed: false,
          fingerprint: fp,
          reason: 'Acesso bloqueado por atividade suspeita anterior'
        };
      }

      const detectionResult = await Promise.race([
        botDetector.detect(),
        new Promise<any>((resolve) =>
          setTimeout(() => resolve({ isBot: false, isSuspicious: false, score: 0, detections: [], details: {} }), 1000)
        )
      ]);

      if (detectionResult.isBot) {
        this.blockFingerprint(fp, 'bot-detected', detectionResult).catch(console.error);
        this.logAccess(fp, true, 'bot-detected', detectionResult).catch(console.error);
        return {
          allowed: false,
          fingerprint: fp,
          reason: 'Bot ou automação detectada',
          detectionResult
        };
      }

      this.logAccess(fp, detectionResult.isSuspicious, detectionResult.isSuspicious ? 'suspicious-activity' : 'clean', detectionResult).catch(console.error);

      return {
        allowed: true,
        fingerprint: fp,
        detectionResult
      };
    } catch (error) {
      console.error('[Protection] System error:', error);
      return {
        allowed: true,
        fingerprint: 'error-' + Date.now(),
        reason: 'Erro no sistema de proteção'
      };
    }
  }

  private async checkIfBlocked(fp: string): Promise<boolean> {
    try {
      const { data, error } = await Promise.race([
        supabase
          .from('blocked_fingerprints')
          .select('id')
          .eq('fingerprint', fp)
          .maybeSingle(),
        new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Check blocked timeout')), 3000)
        )
      ]);

      if (error) {
        console.error('[Protection] Error checking blocked fingerprint:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('[Protection] Error in checkIfBlocked:', error);
      return false;
    }
  }

  private async blockFingerprint(
    fp: string,
    reason: string,
    detectionResult: BotDetectionResult
  ): Promise<void> {
    try {
      const { error } = await Promise.race([
        supabase.from('blocked_fingerprints').insert({
          fingerprint: fp,
          reason,
          user_agent: navigator.userAgent,
          detection_details: {
            score: detectionResult.score,
            detections: detectionResult.detections,
            details: detectionResult.details
          },
          is_permanent: detectionResult.isBot,
          blocked_at: new Date().toISOString(),
          last_attempt: new Date().toISOString()
        }),
        new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Block insert timeout')), 3000)
        )
      ]);

      if (error) {
        console.error('[Protection] Error blocking fingerprint:', error);
      }
    } catch (error) {
      console.error('[Protection] Error blocking fingerprint:', error);
    }
  }

  private async logAccess(
    fp: string,
    suspicious: boolean,
    reason: string,
    detectionResult?: BotDetectionResult
  ): Promise<void> {
    try {
      const { error } = await Promise.race([
        supabase.from('access_logs').insert({
          fingerprint: fp,
          is_suspicious: suspicious,
          user_agent: navigator.userAgent,
          detection_results: detectionResult
            ? {
                score: detectionResult.score,
                detections: detectionResult.detections,
                reason
              }
            : { reason },
          accessed_at: new Date().toISOString()
        }),
        new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Log insert timeout')), 3000)
        )
      ]);

      if (error) {
        console.error('[Protection] Error logging access:', error);
      }
    } catch (error) {
      console.error('[Protection] Error logging access:', error);
    }
  }

  private async getSuspiciousCount(fp: string): Promise<number> {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data, error } = await Promise.race([
        supabase
          .from('access_logs')
          .select('id')
          .eq('fingerprint', fp)
          .eq('is_suspicious', true)
          .gte('accessed_at', oneDayAgo.toISOString()),
        new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Count query timeout')), 3000)
        )
      ]);

      if (error) {
        console.error('[Protection] Error getting suspicious count:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('[Protection] Error in getSuspiciousCount:', error);
      return 0;
    }
  }

  getFingerprint(): string | null {
    return this.fingerprintCache;
  }
}

export const protectionSystem = new ProtectionSystem();
