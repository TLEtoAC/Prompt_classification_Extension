CREATE TABLE prompt_evaluations (
  id SERIAL PRIMARY KEY,
  prompt TEXT NOT NULL,
  complexity VARCHAR(10) NOT NULL,
  reason TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_complexity ON prompt_evaluations(complexity);
CREATE INDEX idx_timestamp ON prompt_evaluations(timestamp);
