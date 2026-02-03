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
      const fp = await fingerprint.get();
      this.fingerprintCache = fp;

      const isBlocked = await this.checkIfBlocked(fp);
      if (isBlocked) {
        await this.logAccess(fp, true, 'previously-blocked');
        return {
          allowed: false,
          fingerprint: fp,
          reason: 'Acesso bloqueado por atividade suspeita anterior'
        };
      }

      const detectionResult = await botDetector.detect();

      if (detectionResult.isBot) {
        await this.blockFingerprint(fp, 'bot-detected', detectionResult);
        await this.logAccess(fp, true, 'bot-detected', detectionResult);
        return {
          allowed: false,
          fingerprint: fp,
          reason: 'Bot ou automação detectada',
          detectionResult
        };
      }

      if (detectionResult.isSuspicious) {
        await this.logAccess(fp, true, 'suspicious-activity', detectionResult);

        const suspiciousCount = await this.getSuspiciousCount(fp);
        if (suspiciousCount >= 3) {
          await this.blockFingerprint(fp, 'repeated-suspicious-activity', detectionResult);
          return {
            allowed: false,
            fingerprint: fp,
            reason: 'Múltiplas atividades suspeitas detectadas',
            detectionResult
          };
        }
      } else {
        await this.logAccess(fp, false, 'clean', detectionResult);
      }

      return {
        allowed: true,
        fingerprint: fp,
        detectionResult
      };
    } catch (error) {
      console.error('Protection system error:', error);
      return {
        allowed: true,
        fingerprint: 'error',
        reason: 'Erro no sistema de proteção'
      };
    }
  }

  private async checkIfBlocked(fp: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('blocked_fingerprints')
        .select('id')
        .eq('fingerprint', fp)
        .maybeSingle();

      if (error) {
        console.error('Error checking blocked fingerprint:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in checkIfBlocked:', error);
      return false;
    }
  }

  private async blockFingerprint(
    fp: string,
    reason: string,
    detectionResult: BotDetectionResult
  ): Promise<void> {
    try {
      await supabase.from('blocked_fingerprints').insert({
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
      });
    } catch (error) {
      console.error('Error blocking fingerprint:', error);
    }
  }

  private async logAccess(
    fp: string,
    suspicious: boolean,
    reason: string,
    detectionResult?: BotDetectionResult
  ): Promise<void> {
    try {
      await supabase.from('access_logs').insert({
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
      });
    } catch (error) {
      console.error('Error logging access:', error);
    }
  }

  private async getSuspiciousCount(fp: string): Promise<number> {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data, error } = await supabase
        .from('access_logs')
        .select('id')
        .eq('fingerprint', fp)
        .eq('is_suspicious', true)
        .gte('accessed_at', oneDayAgo.toISOString());

      if (error) {
        console.error('Error getting suspicious count:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error in getSuspiciousCount:', error);
      return 0;
    }
  }

  getFingerprint(): string | null {
    return this.fingerprintCache;
  }
}

export const protectionSystem = new ProtectionSystem();
