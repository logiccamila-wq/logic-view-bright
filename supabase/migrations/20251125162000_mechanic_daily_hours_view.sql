-- View de horas diárias de mecânicos, calculando total e horas extras
CREATE OR REPLACE VIEW public.mechanic_daily_hours AS
WITH events AS (
  SELECT
    mechanic_id,
    DATE(timestamp) AS dia,
    punch_type,
    timestamp
  FROM public.mechanic_clock_in
),
day_bounds AS (
  SELECT
    mechanic_id,
    dia,
    MIN(timestamp) FILTER (WHERE punch_type = 'entrada') AS entrada,
    MAX(timestamp) FILTER (WHERE punch_type = 'saida') AS saida
  FROM events
  GROUP BY mechanic_id, dia
),
lunch_pairs AS (
  SELECT
    mechanic_id,
    dia,
    punch_type,
    timestamp,
    LEAD(timestamp) OVER (PARTITION BY mechanic_id, dia ORDER BY timestamp) AS next_timestamp,
    LEAD(punch_type) OVER (PARTITION BY mechanic_id, dia ORDER BY timestamp) AS next_punch_type
  FROM events
  WHERE punch_type IN ('almoco_inicio','almoco_fim')
),
lunch AS (
  SELECT
    mechanic_id,
    dia,
    SUM(
      CASE WHEN next_punch_type = 'almoco_fim'
           THEN EXTRACT(EPOCH FROM (next_timestamp - timestamp)) / 60
           ELSE 0 END
    ) AS lunch_minutes
  FROM lunch_pairs
  WHERE punch_type = 'almoco_inicio'
  GROUP BY mechanic_id, dia
),
agg AS (
  SELECT
    d.mechanic_id,
    d.dia,
    d.entrada,
    d.saida,
    COALESCE(l.lunch_minutes, 0) AS lunch_minutes
  FROM day_bounds d
  LEFT JOIN lunch l ON l.mechanic_id = d.mechanic_id AND l.dia = d.dia
)
SELECT
  e.id AS employee_id,
  a.dia,
  GREATEST(0, (EXTRACT(EPOCH FROM (a.saida - a.entrada)) / 60) - a.lunch_minutes)::int AS total_minutes,
  GREATEST(0, ((EXTRACT(EPOCH FROM (a.saida - a.entrada)) / 60) - a.lunch_minutes) - (8 * 60))::int AS overtime_minutes
FROM agg a
JOIN public.employees e ON e.user_id = a.mechanic_id
WHERE a.entrada IS NOT NULL AND a.saida IS NOT NULL;

COMMENT ON VIEW public.mechanic_daily_hours IS 'Horas totais e extras por dia para cada funcionário (mecânico), baseado nas marcações de ponto';