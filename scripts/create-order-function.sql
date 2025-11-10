-- Create atomic order creation function
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_customer_id uuid,
  p_delivery_address text,
  p_total_amount_tsh integer,
  p_special_instructions text DEFAULT NULL,
  p_order_items jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_garment_name text;
  v_delivery_fee_tsh integer := 3000; -- Fixed delivery fee
BEGIN
  -- Start transaction
  BEGIN
    -- Insert order with fixed delivery fee
    INSERT INTO orders (
      customer_id,
      status,
      delivery_address,
      total_amount_tsh,
      delivery_fee_tsh,
      special_instructions
    ) VALUES (
      p_customer_id,
      'pending',
      p_delivery_address,
      p_total_amount_tsh,
      v_delivery_fee_tsh,
      p_special_instructions
    ) RETURNING id INTO v_order_id;

    -- Insert order items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_order_items)
    LOOP
      -- Get garment item name
      SELECT name INTO v_garment_name
      FROM garment_items 
      WHERE id = (v_item->>'garment_item_id')::uuid;
      
      IF v_garment_name IS NULL THEN
        RAISE EXCEPTION 'Garment item not found: %', v_item->>'garment_item_id';
      END IF;

      -- Insert order item
      INSERT INTO order_items (
        order_id,
        garment_item_id,
        item_name,
        quantity,
        unit_price_tsh,
        total_price_tsh,
        special_instructions
      ) VALUES (
        v_order_id,
        (v_item->>'garment_item_id')::uuid,
        v_garment_name,
        (v_item->>'quantity')::integer,
        (v_item->>'unit_price_tsh')::integer,
        (v_item->>'total_price_tsh')::integer,
        v_item->>'special_instructions'
      );
    END LOOP;

    RETURN v_order_id;
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback happens automatically
      RAISE;
  END;
END;
$$; 