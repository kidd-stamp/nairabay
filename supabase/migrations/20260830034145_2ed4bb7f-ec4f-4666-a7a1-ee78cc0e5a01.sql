INSERT INTO public.sellers (id, phone_number, bay_handle, display_name, location_state, location_city, phone_verified_at)
VALUES
  ('11111111-1111-4111-8111-111111111111', '08034562342', 'bay2342', 'Amaka Stores', 'Lagos', 'Ikeja', now()),
  ('22222222-2222-4222-8222-222222222222', '08123457788', 'bay7788', 'Tunde Gadgets', 'FCT - Abuja', 'Wuse', now())
ON CONFLICT DO NOTHING;

INSERT INTO public.items (seller_id, title, price, category, description, image_path, location_state, location_city, status)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Clean white sneakers (size 42)', 18500, 'Footwear', 'Barely worn, no stains. Meet at Ikeja City Mall.', '65bb0e56-130d-4eb4-88a2-b40dd51182c7.jpg', 'Lagos', 'Ikeja', 'active'),
  ('22222222-2222-4222-8222-222222222222', 'iPhone 13 Pro 256GB', 465000, 'Phones & Gadgets', 'Battery health 89%. Face ID working. Comes with charger.', 'cecf254e-d6ee-4f36-8dad-5f9130aa68b9.jpg', 'FCT - Abuja', 'Wuse', 'active'),
  ('11111111-1111-4111-8111-111111111111', 'Ankara midi dress', 12000, 'Fashion', 'Hand-sewn ankara dress, fits UK 10-12.', 'd214a1e4-4400-4852-98b8-17fe3034b56a.jpg', 'Lagos', 'Surulere', 'active'),
  ('22222222-2222-4222-8222-222222222222', 'Portable 2.5KVA generator', 155000, 'Home & Furniture', 'Used for 8 months, starts first pull. Fuel efficient.', '2e3cf136-a472-4d65-807b-ecc62f460afe.jpg', 'FCT - Abuja', 'Garki', 'active'),
  ('11111111-1111-4111-8111-111111111111', '3-seater grey fabric sofa', 210000, 'Home & Furniture', 'Neat and firm. Buyer arranges pickup in Lekki.', '4e6c96a0-6b2d-4bc2-9c64-0c11dfff03b2.jpg', 'Lagos', 'Lekki', 'active'),
  ('22222222-2222-4222-8222-222222222222', 'MacBook Pro 15" (2019, 16GB RAM)', 720000, 'Electronics', 'Core i7, 512GB SSD. Screen perfect, no dents.', '0d752c85-fad3-4ef8-b46d-ccc8dc334d22.jpg', 'FCT - Abuja', 'Wuse 2', 'active');