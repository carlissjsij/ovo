/*
  # Sistema de Bloqueio por Fingerprint

  ## Descrição
  Cria tabela para armazenar fingerprints bloqueados e detectar acessos suspeitos
  de bots, crawlers e ambientes automatizados de plataformas como Meta, Instagram e TikTok.

  ## 1. Novas Tabelas
    - `blocked_fingerprints`
      - `id` (uuid, primary key) - ID único do registro
      - `fingerprint` (text, unique) - Hash único do fingerprint do navegador
      - `reason` (text) - Motivo do bloqueio (bot_detected, headless_browser, suspicious_activity, etc)
      - `user_agent` (text) - User agent do navegador detectado
      - `ip_address` (text, nullable) - Endereço IP (se disponível)
      - `detection_details` (jsonb) - Detalhes técnicos da detecção
      - `blocked_at` (timestamptz) - Data/hora do bloqueio
      - `block_count` (integer) - Número de vezes que este fingerprint foi bloqueado
      - `last_attempt` (timestamptz) - Última tentativa de acesso
      - `is_permanent` (boolean) - Se o bloqueio é permanente
      - `created_at` (timestamptz) - Data de criação
      - `updated_at` (timestamptz) - Data de atualização

    - `access_logs`
      - `id` (uuid, primary key) - ID único do registro
      - `fingerprint` (text) - Hash do fingerprint
      - `is_suspicious` (boolean) - Se o acesso foi marcado como suspeito
      - `user_agent` (text) - User agent
      - `ip_address` (text, nullable) - Endereço IP
      - `detection_results` (jsonb) - Resultados das verificações de segurança
      - `accessed_at` (timestamptz) - Data/hora do acesso
      - `created_at` (timestamptz) - Data de criação

  ## 2. Índices
    - Índice em `fingerprint` para buscas rápidas
    - Índice em `is_suspicious` para análise de padrões
    - Índice em `accessed_at` para análise temporal

  ## 3. Segurança
    - RLS habilitado em ambas as tabelas
    - Apenas operações de INSERT permitidas (sem leitura pública)
    - Service role tem acesso total para análise

  ## 4. Notas Importantes
    - Sistema detecta: bots, headless browsers, automação, user-agents suspeitos
    - Fingerprints bloqueados impedem acesso à aplicação
    - Logs permitem análise de padrões de ataque
    - Sistema auto-atualiza contadores de tentativas
*/

-- Criar tabela de fingerprints bloqueados
CREATE TABLE IF NOT EXISTS blocked_fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text UNIQUE NOT NULL,
  reason text NOT NULL,
  user_agent text,
  ip_address text,
  detection_details jsonb DEFAULT '{}'::jsonb,
  blocked_at timestamptz DEFAULT now(),
  block_count integer DEFAULT 1,
  last_attempt timestamptz DEFAULT now(),
  is_permanent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de logs de acesso
CREATE TABLE IF NOT EXISTS access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text NOT NULL,
  is_suspicious boolean DEFAULT false,
  user_agent text,
  ip_address text,
  detection_results jsonb DEFAULT '{}'::jsonb,
  accessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_blocked_fingerprints_fingerprint 
  ON blocked_fingerprints(fingerprint);

CREATE INDEX IF NOT EXISTS idx_blocked_fingerprints_last_attempt 
  ON blocked_fingerprints(last_attempt);

CREATE INDEX IF NOT EXISTS idx_access_logs_fingerprint 
  ON access_logs(fingerprint);

CREATE INDEX IF NOT EXISTS idx_access_logs_suspicious 
  ON access_logs(is_suspicious);

CREATE INDEX IF NOT EXISTS idx_access_logs_accessed_at 
  ON access_logs(accessed_at);

-- Habilitar RLS
ALTER TABLE blocked_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - apenas inserção permitida, sem leitura pública
CREATE POLICY "Allow insert blocked fingerprints"
  ON blocked_fingerprints
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow insert access logs"
  ON access_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Função para atualizar contador de bloqueios
CREATE OR REPLACE FUNCTION update_block_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE blocked_fingerprints
  SET 
    block_count = block_count + 1,
    last_attempt = now(),
    updated_at = now()
  WHERE fingerprint = NEW.fingerprint;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contador quando houver tentativa de acesso bloqueado
CREATE TRIGGER on_blocked_access_attempt
  AFTER INSERT ON access_logs
  FOR EACH ROW
  WHEN (NEW.is_suspicious = true)
  EXECUTE FUNCTION update_block_count();