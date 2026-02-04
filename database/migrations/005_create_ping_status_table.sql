-- Migration: Create router ping status table
-- Purpose: Store real-time ping status for routers (updated every 5 minutes)

CREATE TABLE IF NOT EXISTS router_ping_status (
  router_id INTEGER PRIMARY KEY REFERENCES routers(id) ON DELETE CASCADE,
  is_online BOOLEAN NOT NULL DEFAULT false,
  response_time FLOAT,
  packet_loss FLOAT,
  last_checked TIMESTAMP NOT NULL DEFAULT NOW(),
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_ping_status_online ON router_ping_status(is_online);
CREATE INDEX IF NOT EXISTS idx_ping_status_last_checked ON router_ping_status(last_checked);

-- Comments
COMMENT ON TABLE router_ping_status IS 'Real-time ping status for routers (updated every 5 minutes)';
COMMENT ON COLUMN router_ping_status.is_online IS 'Whether router is reachable via ping';
COMMENT ON COLUMN router_ping_status.response_time IS 'Ping response time in milliseconds';
COMMENT ON COLUMN router_ping_status.packet_loss IS 'Packet loss percentage';
COMMENT ON COLUMN router_ping_status.last_checked IS 'Last time ping was performed';

-- Function to update ping status
CREATE OR REPLACE FUNCTION update_router_ping_status(
  p_router_id INTEGER,
  p_is_online BOOLEAN,
  p_response_time FLOAT DEFAULT NULL,
  p_packet_loss FLOAT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO router_ping_status (
    router_id,
    is_online,
    response_time,
    packet_loss,
    error_message,
    last_checked,
    updated_at
  )
  VALUES (
    p_router_id,
    p_is_online,
    p_response_time,
    p_packet_loss,
    p_error_message,
    NOW(),
    NOW()
  )
  ON CONFLICT (router_id) 
  DO UPDATE SET
    is_online = EXCLUDED.is_online,
    response_time = EXCLUDED.response_time,
    packet_loss = EXCLUDED.packet_loss,
    error_message = EXCLUDED.error_message,
    last_checked = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_router_ping_status IS 'Update or insert router ping status';
