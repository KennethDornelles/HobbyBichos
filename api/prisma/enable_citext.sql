-- Script para habilitar extensão citext no PostgreSQL
-- Execute este script ANTES de rodar as migrations

CREATE EXTENSION IF NOT EXISTS citext;

-- Verificar se a extensão foi criada com sucesso
SELECT * FROM pg_extension WHERE extname = 'citext';