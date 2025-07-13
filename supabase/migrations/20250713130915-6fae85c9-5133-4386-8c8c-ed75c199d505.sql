-- Limpiar insights anteriores simulados y preparar para datos reales
DELETE FROM behavioral_insights WHERE created_at < NOW() - INTERVAL '1 hour';

-- Limpiar logs de sincronización antiguos
DELETE FROM data_sync_logs WHERE sync_timestamp < NOW() - INTERVAL '2 hours';