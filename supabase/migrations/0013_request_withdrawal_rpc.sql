-- Migration 0013: SECURITY DEFINER RPC for wallet withdrawal requests
-- Fixes RLS gap: wallet_transactions has no INSERT policy (by design, service_role only)
-- Users call this RPC instead of direct INSERT to create pending withdrawal transactions

CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_wallet_id uuid,
  p_amount integer,
  p_bank_name text,
  p_account_number text,
  p_account_holder text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_wallet_balance integer;
  v_tx_id uuid;
BEGIN
  -- Verify caller owns this wallet
  SELECT user_id, balance INTO v_user_id, v_wallet_balance
  FROM public.wallets
  WHERE id = p_wallet_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Dompet tidak ditemukan';
  END IF;

  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: dompet bukan milik Anda';
  END IF;

  -- Check sufficient balance
  IF v_wallet_balance < p_amount THEN
    RAISE EXCEPTION 'Saldo tidak mencukupi';
  END IF;

  -- Insert pending withdrawal transaction (negative amount)
  INSERT INTO public.wallet_transactions (wallet_id, type, amount, status, bank_name, account_number, account_holder)
  VALUES (p_wallet_id, 'withdrawal', -p_amount, 'pending', p_bank_name, p_account_number, p_account_holder)
  RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object('id', v_tx_id);
END;
$$;
