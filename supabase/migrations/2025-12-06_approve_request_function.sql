
CREATE OR REPLACE FUNCTION public.approve_inventory_request(
  p_request_id uuid,
  p_approver_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_id uuid;
  v_quantity int;
  v_current_stock int;
  v_status text;
  v_item_name text;
  v_item_code text;
BEGIN
  -- Get request details
  SELECT item_id, quantity, status
  INTO v_item_id, v_quantity, v_status
  FROM public.inventory_requests
  WHERE id = p_request_id;

  -- Validation
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  IF v_status != 'pending' THEN
    RAISE EXCEPTION 'Request is not pending';
  END IF;

  -- Check stock
  SELECT quantity, part_name, part_code
  INTO v_current_stock, v_item_name, v_item_code
  FROM public.workshop_inventory
  WHERE id = v_item_id;

  IF v_current_stock < v_quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Current: %, Requested: %', v_current_stock, v_quantity;
  END IF;

  -- Update inventory
  UPDATE public.workshop_inventory
  SET quantity = quantity - v_quantity,
      updated_at = now()
  WHERE id = v_item_id;

  -- Create movement record
  INSERT INTO public.inventory_movements (
    item_id,
    movement_type,
    quantity,
    reason,
    created_at
  ) VALUES (
    v_item_id,
    'saida',
    v_quantity,
    'Solicitação Aprovada (Req: ' || p_request_id || ')',
    now()
  );

  -- Update request status
  UPDATE public.inventory_requests
  SET status = 'approved',
      approved_by = p_approver_id,
      updated_at = now()
  WHERE id = p_request_id;

END;
$$;

CREATE OR REPLACE FUNCTION public.reject_inventory_request(
  p_request_id uuid,
  p_approver_id uuid,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.inventory_requests
  SET status = 'rejected',
      approved_by = p_approver_id,
      rejection_reason = p_reason,
      updated_at = now()
  WHERE id = p_request_id;
END;
$$;
