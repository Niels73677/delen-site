-- ATELIER sample catalog. Generated deterministically; safe to re-run against an empty database.
-- Photography: Unsplash (https://unsplash.com/license) — free to use commercially and non-commercially.

begin;

insert into public.categories (id, slug, name, description, sort_order) values ('0359c334-0f16-5af2-8bd1-42693ca55774', 'tees', 'T-Shirts', 'Heavyweight cotton built to hold its shape.', 0);
insert into public.categories (id, slug, name, description, sort_order) values ('2533e8fc-d045-5e05-8258-a9578348f069', 'sweatshirts', 'Sweatshirts & Hoodies', 'Loopback and brushed fleece in relaxed proportions.', 1);
insert into public.categories (id, slug, name, description, sort_order) values ('1637eb04-47e9-5f3e-92fe-4254d01da77c', 'shirts', 'Shirts', 'Oxford, chambray and poplin with clean collars.', 2);
insert into public.categories (id, slug, name, description, sort_order) values ('86b179e8-4a51-590e-965e-3cfe76cd5ed7', 'outerwear', 'Outerwear', 'Coats and jackets designed to layer.', 3);
insert into public.categories (id, slug, name, description, sort_order) values ('a72d8e7d-6040-5189-a586-8fe723d35e70', 'trousers', 'Trousers & Denim', 'Considered cuts from straight to wide.', 4);
insert into public.categories (id, slug, name, description, sort_order) values ('11d2c2c1-c1ff-5495-a6b0-83e50bd9030a', 'accessories', 'Accessories', 'The finishing pieces.', 5);

insert into public.collections (id, slug, name, description, image_url, image_alt, sort_order) values ('54260fdb-5062-5ed6-acac-67b5728e8246', 'new-arrivals', 'New Arrivals', 'The latest additions to the wardrobe — autumn/winter 2026.', 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=2000&q=80', 'Man in a camel jacket and ecru trousers seated on a wooden stool', 0);
insert into public.collections (id, slug, name, description, image_url, image_alt, sort_order) values ('19329b73-5298-5eda-8256-52e60e3b5d3b', 'essentials', 'Essentials', 'The foundation: pieces you reach for every day.', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=2000&q=80', 'Sage green t-shirts hanging on natural wood hangers', 1);
insert into public.collections (id, slug, name, description, image_url, image_alt, sort_order) values ('83dcf652-7937-5a8a-be83-45544af4bb0d', 'outerwear', 'Outerwear', 'Structured layers for changing weather.', 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=2000&q=80', 'Woman wearing an oversized olive field jacket', 2);
insert into public.collections (id, slug, name, description, image_url, image_alt, sort_order) values ('5c5a5715-0d35-5744-a937-c0be7a173817', 'accessories', 'Accessories', 'Caps, bags and the details that finish an outfit.', 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=2000&q=80', 'Flat lay of leather boots, belt, sunglasses and a watch', 3);

-- Essential Heavyweight Tee
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'essential-heavyweight-tee', 'Essential Heavyweight Tee', 'Our foundation tee, knitted from 260 gsm combed cotton for a dense, matte hand that softens with every wash. A slightly dropped shoulder and a tight rib collar keep the shape clean and modern.', array['260 gsm heavyweight jersey', 'Double-needle stitching throughout', 'Tight 2.5 cm rib collar', 'Pre-shrunk and garment washed']::text[], '100% organic cotton', 'Machine wash cold, inside out. Do not tumble dry. Iron on reverse.', 'Relaxed fit. True to size — size down for a closer fit.', 4500, null, '0359c334-0f16-5af2-8bd1-42693ca55774', 'active', true, false, 96, now() - interval '122 days', now() - interval '122 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80', 'Essential Heavyweight Tee in white', 'White', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1600&q=80', 'Essential Heavyweight Tee in black', 'Black', 1);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=1600&q=80', 'Essential Heavyweight Tee in sky', 'Sky', 2);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1600&q=80', 'Essential Heavyweight Tee — detail', null, 3);
insert into public.product_collections (product_id, collection_id) values ('c3ab697b-cd49-5ed8-b744-76ccd8f05775', '19329b73-5298-5eda-8256-52e60e3b5d3b');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('f3948d75-416c-5008-a94b-7bf168308ba7', 'c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'AT-EHT-WHI-XS', 'White', '#F4F3EF', 'XS', 0);
update public.inventory set quantity = 18 where variant_id = 'f3948d75-416c-5008-a94b-7bf168308ba7';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('fef93a20-88b4-53cb-90e0-56d62b9c4ce0', 'c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'AT-EHT-WHI-S', 'White', '#F4F3EF', 'S', 1);
update public.inventory set quantity = 8 where variant_id = 'fef93a20-88b4-53cb-90e0-56d62b9c4ce0';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('40794969-dead-5a3f-97f3-f1679f031f49', 'c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'AT-EHT-WHI-M', 'White', '#F4F3EF', 'M', 2);
update public.inventory set quantity = 9 where variant_id = '40794969-dead-5a3f-97f3-f1679f031f49';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('93f4c335-8799-5b78-9936-bf1968d10696', 'c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'AT-EHT-WHI-L', 'White', '#F4F3EF', 'L', 3);
update public.inventory set quantity = 7 where variant_id = '93f4c335-8799-5b78-9936-bf1968d10696';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('c33b4ddc-6d15-5a6e-b3f8-c4efff272a5b', 'c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'AT-EHT-WHI-XL', 'White', '#F4F3EF', 'XL', 4);
update public.inventory set quantity = 12 where variant_id = 'c33b4ddc-6d15-5a6e-b3f8-c4efff272a5b';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('296d154f-3b0c-5c79-a391-eb242459aefa', 'c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'AT-EHT-BLA-XS', 'Black', '#1A1A1A', 'XS', 0);
update public.inventory set quantity = 0 where variant_id = '296d154f-3b0c-5c79-a391-eb242459aefa';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('f5aef7ba-1602-5d74-9fe2-8670a8648a51', 'c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'AT-EHT-BLA-S', 'Black', '#1A1A1A', 'S', 1);
update public.inventory set quantity = 8 where variant_id = 'f5aef7ba-1602-5d74-9fe2-8670a8648a51';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('f1af1a63-e367-58b4-bf84-e6dbb9e4de90', 'c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'AT-EHT-BLA-M', 'Black', '#1A1A1A', 'M', 2);
update public.inventory set quantity = 3 where variant_id = 'f1af1a63-e367-58b4-bf84-e6dbb9e4de90';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('4784e7cf-8c2e-5573-ab85-123769cb67b8', 'c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'AT-EHT-BLA-L', 'Black', '#1A1A1A', 'L', 3);
update public.inventory set quantity = 24 where variant_id = '4784e7cf-8c2e-5573-ab85-123769cb67b8';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('4ed793f4-2d86-5b7f-8987-db735f02c6d2', 'c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'AT-EHT-BLA-XL', 'Black', '#1A1A1A', 'XL', 4);
update public.inventory set quantity = 1 where variant_id = '4ed793f4-2d86-5b7f-8987-db735f02c6d2';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('f54ce4e5-f1b7-5bb8-bbd4-00ea9955d628', 'c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'AT-EHT-SKY-XS', 'Sky', '#A9BCCB', 'XS', 0);
update public.inventory set quantity = 24 where variant_id = 'f54ce4e5-f1b7-5bb8-bbd4-00ea9955d628';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('b735c96f-a942-524e-84c8-d4314e744b71', 'c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'AT-EHT-SKY-S', 'Sky', '#A9BCCB', 'S', 1);
update public.inventory set quantity = 24 where variant_id = 'b735c96f-a942-524e-84c8-d4314e744b71';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('803d9b02-4572-5309-a8c4-fd4c44664990', 'c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'AT-EHT-SKY-M', 'Sky', '#A9BCCB', 'M', 2);
update public.inventory set quantity = 7 where variant_id = '803d9b02-4572-5309-a8c4-fd4c44664990';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('e7341c6b-b999-5725-aac0-8813a026b658', 'c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'AT-EHT-SKY-L', 'Sky', '#A9BCCB', 'L', 3);
update public.inventory set quantity = 7 where variant_id = 'e7341c6b-b999-5725-aac0-8813a026b658';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('892bd6cb-65a7-5e1d-b2aa-e29ad5a1ab6b', 'c3ab697b-cd49-5ed8-b744-76ccd8f05775', 'AT-EHT-SKY-XL', 'Sky', '#A9BCCB', 'XL', 4);
update public.inventory set quantity = 10 where variant_id = '892bd6cb-65a7-5e1d-b2aa-e29ad5a1ab6b';

-- Relaxed Boxy Tee
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('acfd1d44-a662-5868-a394-b1d6c5f627ee', 'relaxed-boxy-tee', 'Relaxed Boxy Tee', 'A boxy, cropped tee with a wide body and short sleeve. Garment dyed and enzyme washed for a lived-in tone from the first wear.', array['240 gsm cotton jersey', 'Garment dyed', 'Cropped, boxy body', 'Small tonal print at chest']::text[], '100% cotton', 'Machine wash cold with similar colours. Line dry.', 'Oversized fit. Size down for a regular fit.', 5500, null, '0359c334-0f16-5af2-8bd1-42693ca55774', 'active', false, false, 64, now() - interval '114 days', now() - interval '114 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('acfd1d44-a662-5868-a394-b1d6c5f627ee', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1600&q=80', 'Relaxed Boxy Tee in washed black', 'Washed Black', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('acfd1d44-a662-5868-a394-b1d6c5f627ee', 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=1600&q=80', 'Relaxed Boxy Tee in washed black', 'Washed Black', 1);
insert into public.product_collections (product_id, collection_id) values ('acfd1d44-a662-5868-a394-b1d6c5f627ee', '19329b73-5298-5eda-8256-52e60e3b5d3b');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('cc711e21-3cf0-5d59-bef9-09f65226ab66', 'acfd1d44-a662-5868-a394-b1d6c5f627ee', 'AT-RBT-WAS-XS', 'Washed Black', '#232323', 'XS', 0);
update public.inventory set quantity = 23 where variant_id = 'cc711e21-3cf0-5d59-bef9-09f65226ab66';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('5db1fe28-6807-5610-9250-20dd3adcbaa4', 'acfd1d44-a662-5868-a394-b1d6c5f627ee', 'AT-RBT-WAS-S', 'Washed Black', '#232323', 'S', 1);
update public.inventory set quantity = 0 where variant_id = '5db1fe28-6807-5610-9250-20dd3adcbaa4';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('56f4227e-eeab-5a65-81e5-532393e9b389', 'acfd1d44-a662-5868-a394-b1d6c5f627ee', 'AT-RBT-WAS-M', 'Washed Black', '#232323', 'M', 2);
update public.inventory set quantity = 27 where variant_id = '56f4227e-eeab-5a65-81e5-532393e9b389';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('b7475ad9-6a7c-5118-8b79-bfea50ce45d3', 'acfd1d44-a662-5868-a394-b1d6c5f627ee', 'AT-RBT-WAS-L', 'Washed Black', '#232323', 'L', 3);
update public.inventory set quantity = 3 where variant_id = 'b7475ad9-6a7c-5118-8b79-bfea50ce45d3';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('06d673d1-675b-5226-8dfa-238ed8304f6e', 'acfd1d44-a662-5868-a394-b1d6c5f627ee', 'AT-RBT-WAS-XL', 'Washed Black', '#232323', 'XL', 4);
update public.inventory set quantity = 12 where variant_id = '06d673d1-675b-5226-8dfa-238ed8304f6e';

-- Relaxed Fleece Hoodie
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('57c18214-03aa-5eec-a8ab-37d5f91bef2b', 'relaxed-fleece-hoodie', 'Relaxed Fleece Hoodie', 'Brushed-back fleece hoodie with a double-layer hood and a deep kangaroo pocket. Heavy enough to wear as a layer through autumn.', array['460 gsm brushed fleece', 'Double-layer hood, no drawcords', 'Ribbed cuffs and hem', 'Dropped shoulder']::text[], '80% cotton, 20% recycled polyester', 'Machine wash 30°C inside out. Do not tumble dry.', 'Relaxed fit. True to size.', 12000, null, '2533e8fc-d045-5e05-8258-a9578348f069', 'active', true, false, 88, now() - interval '135 days', now() - interval '135 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('57c18214-03aa-5eec-a8ab-37d5f91bef2b', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1600&q=80', 'Relaxed Fleece Hoodie in heather grey', 'Heather Grey', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('57c18214-03aa-5eec-a8ab-37d5f91bef2b', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1600&q=80', 'Relaxed Fleece Hoodie — detail', null, 1);
insert into public.product_collections (product_id, collection_id) values ('57c18214-03aa-5eec-a8ab-37d5f91bef2b', '19329b73-5298-5eda-8256-52e60e3b5d3b');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('688ee22e-ffb2-559a-a516-030e4ebb3837', '57c18214-03aa-5eec-a8ab-37d5f91bef2b', 'AT-RFH-HEA-XS', 'Heather Grey', '#A3A3A0', 'XS', 0);
update public.inventory set quantity = 0 where variant_id = '688ee22e-ffb2-559a-a516-030e4ebb3837';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('984248fc-6829-51a3-8b94-6946fe740f04', '57c18214-03aa-5eec-a8ab-37d5f91bef2b', 'AT-RFH-HEA-S', 'Heather Grey', '#A3A3A0', 'S', 1);
update public.inventory set quantity = 24 where variant_id = '984248fc-6829-51a3-8b94-6946fe740f04';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('a3d01b1d-f9f4-5128-b523-14c54a704651', '57c18214-03aa-5eec-a8ab-37d5f91bef2b', 'AT-RFH-HEA-M', 'Heather Grey', '#A3A3A0', 'M', 2);
update public.inventory set quantity = 0 where variant_id = 'a3d01b1d-f9f4-5128-b523-14c54a704651';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('d2f23adf-c11f-5003-bec1-55db75a212b0', '57c18214-03aa-5eec-a8ab-37d5f91bef2b', 'AT-RFH-HEA-L', 'Heather Grey', '#A3A3A0', 'L', 3);
update public.inventory set quantity = 3 where variant_id = 'd2f23adf-c11f-5003-bec1-55db75a212b0';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('56508383-818a-57a6-a289-82959de0a507', '57c18214-03aa-5eec-a8ab-37d5f91bef2b', 'AT-RFH-HEA-XL', 'Heather Grey', '#A3A3A0', 'XL', 4);
update public.inventory set quantity = 30 where variant_id = '56508383-818a-57a6-a289-82959de0a507';

-- Loopback Crewneck
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('a79efbd4-efbf-5af7-bbd2-3945a7911e0c', 'loopback-crewneck', 'Loopback Crewneck', 'A clean crewneck in dense French terry. Raglan sleeves and a set-in rib give it a softer shoulder and a neat, sporty line.', array['400 gsm loopback French terry', 'Raglan sleeve', 'V-stitch at neckline', 'Ribbed cuffs and hem']::text[], '100% organic cotton', 'Machine wash 30°C. Reshape while damp.', 'Regular fit. True to size.', 9500, null, '2533e8fc-d045-5e05-8258-a9578348f069', 'active', true, true, 71, now() - interval '11 days', now() - interval '11 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('a79efbd4-efbf-5af7-bbd2-3945a7911e0c', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1600&q=80', 'Loopback Crewneck in off white', 'Off White', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('a79efbd4-efbf-5af7-bbd2-3945a7911e0c', 'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1600&q=80', 'Loopback Crewneck in blush', 'Blush', 1);
insert into public.product_collections (product_id, collection_id) values ('a79efbd4-efbf-5af7-bbd2-3945a7911e0c', '19329b73-5298-5eda-8256-52e60e3b5d3b');
insert into public.product_collections (product_id, collection_id) values ('a79efbd4-efbf-5af7-bbd2-3945a7911e0c', '54260fdb-5062-5ed6-acac-67b5728e8246');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('03429ce6-7383-560a-bbeb-dc940391eee2', 'a79efbd4-efbf-5af7-bbd2-3945a7911e0c', 'AT-LC-OFF-XS', 'Off White', '#F2F0EA', 'XS', 0);
update public.inventory set quantity = 20 where variant_id = '03429ce6-7383-560a-bbeb-dc940391eee2';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('4a66a162-e68b-5bce-814f-4646dbf75afc', 'a79efbd4-efbf-5af7-bbd2-3945a7911e0c', 'AT-LC-OFF-S', 'Off White', '#F2F0EA', 'S', 1);
update public.inventory set quantity = 13 where variant_id = '4a66a162-e68b-5bce-814f-4646dbf75afc';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('c4b050f3-c627-5a58-b454-316f39a0c1ca', 'a79efbd4-efbf-5af7-bbd2-3945a7911e0c', 'AT-LC-OFF-M', 'Off White', '#F2F0EA', 'M', 2);
update public.inventory set quantity = 28 where variant_id = 'c4b050f3-c627-5a58-b454-316f39a0c1ca';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('913d89a4-1dcf-5930-bc6b-11d01582ce87', 'a79efbd4-efbf-5af7-bbd2-3945a7911e0c', 'AT-LC-OFF-L', 'Off White', '#F2F0EA', 'L', 3);
update public.inventory set quantity = 8 where variant_id = '913d89a4-1dcf-5930-bc6b-11d01582ce87';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('fc791d68-5787-51c3-8b0b-72d322d8145d', 'a79efbd4-efbf-5af7-bbd2-3945a7911e0c', 'AT-LC-OFF-XL', 'Off White', '#F2F0EA', 'XL', 4);
update public.inventory set quantity = 22 where variant_id = 'fc791d68-5787-51c3-8b0b-72d322d8145d';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('da835127-10a0-56ba-b107-d1d85a13dafd', 'a79efbd4-efbf-5af7-bbd2-3945a7911e0c', 'AT-LC-BLU-XS', 'Blush', '#E7D3CF', 'XS', 0);
update public.inventory set quantity = 16 where variant_id = 'da835127-10a0-56ba-b107-d1d85a13dafd';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('d3a04efe-e745-5217-b01c-9b747adf7329', 'a79efbd4-efbf-5af7-bbd2-3945a7911e0c', 'AT-LC-BLU-S', 'Blush', '#E7D3CF', 'S', 1);
update public.inventory set quantity = 15 where variant_id = 'd3a04efe-e745-5217-b01c-9b747adf7329';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('5e71eb82-f39d-5e9c-a415-d88209a5ad4c', 'a79efbd4-efbf-5af7-bbd2-3945a7911e0c', 'AT-LC-BLU-M', 'Blush', '#E7D3CF', 'M', 2);
update public.inventory set quantity = 8 where variant_id = '5e71eb82-f39d-5e9c-a415-d88209a5ad4c';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('7d52291b-a5ee-56ab-a254-25a5b6dcf2ed', 'a79efbd4-efbf-5af7-bbd2-3945a7911e0c', 'AT-LC-BLU-L', 'Blush', '#E7D3CF', 'L', 3);
update public.inventory set quantity = 0 where variant_id = '7d52291b-a5ee-56ab-a254-25a5b6dcf2ed';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('a631e4eb-d48b-5064-8709-cd61c2776581', 'a79efbd4-efbf-5af7-bbd2-3945a7911e0c', 'AT-LC-BLU-XL', 'Blush', '#E7D3CF', 'XL', 4);
update public.inventory set quantity = 30 where variant_id = 'a631e4eb-d48b-5064-8709-cd61c2776581';

-- Brushed Fleece Sweatshirt
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('a2588ccf-c2b4-58f7-b8a5-4af6d26508d9', 'brushed-fleece-sweatshirt', 'Brushed Fleece Sweatshirt', 'A colour-forward sweatshirt in soft brushed fleece. Cut generously through the body with a slightly cropped length.', array['380 gsm brushed fleece', 'Cropped length', 'Wide ribbed hem']::text[], '80% cotton, 20% recycled polyester', 'Machine wash 30°C. Do not tumble dry.', 'Relaxed fit. True to size.', 9500, null, '2533e8fc-d045-5e05-8258-a9578348f069', 'active', false, false, 40, now() - interval '127 days', now() - interval '127 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('a2588ccf-c2b4-58f7-b8a5-4af6d26508d9', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1600&q=80', 'Brushed Fleece Sweatshirt in amber', 'Amber', 0);
insert into public.product_collections (product_id, collection_id) values ('a2588ccf-c2b4-58f7-b8a5-4af6d26508d9', '19329b73-5298-5eda-8256-52e60e3b5d3b');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('f25b4912-66bc-51e7-bfa1-dfe5301804ff', 'a2588ccf-c2b4-58f7-b8a5-4af6d26508d9', 'AT-BFS-AMB-XS', 'Amber', '#D9822B', 'XS', 0);
update public.inventory set quantity = 2 where variant_id = 'f25b4912-66bc-51e7-bfa1-dfe5301804ff';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('635dbf78-33f1-5e56-b237-e3d5d38f54ff', 'a2588ccf-c2b4-58f7-b8a5-4af6d26508d9', 'AT-BFS-AMB-S', 'Amber', '#D9822B', 'S', 1);
update public.inventory set quantity = 27 where variant_id = '635dbf78-33f1-5e56-b237-e3d5d38f54ff';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('368bccba-98f3-5c25-a932-76d97c3aae92', 'a2588ccf-c2b4-58f7-b8a5-4af6d26508d9', 'AT-BFS-AMB-M', 'Amber', '#D9822B', 'M', 2);
update public.inventory set quantity = 0 where variant_id = '368bccba-98f3-5c25-a932-76d97c3aae92';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('e841820d-b973-5939-8953-d1065ef8396a', 'a2588ccf-c2b4-58f7-b8a5-4af6d26508d9', 'AT-BFS-AMB-L', 'Amber', '#D9822B', 'L', 3);
update public.inventory set quantity = 16 where variant_id = 'e841820d-b973-5939-8953-d1065ef8396a';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('81cd7cd1-2016-536d-9967-4788a94f040e', 'a2588ccf-c2b4-58f7-b8a5-4af6d26508d9', 'AT-BFS-AMB-XL', 'Amber', '#D9822B', 'XL', 4);
update public.inventory set quantity = 17 where variant_id = '81cd7cd1-2016-536d-9967-4788a94f040e';

-- Oxford Button-Down
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('9592c5fd-2111-5b5e-89f2-48fe22e314d5', 'oxford-button-down', 'Oxford Button-Down', 'A softly structured Oxford with a rolled button-down collar. Woven from a compact two-ply yarn that holds a crease but never feels stiff.', array['Two-ply Oxford cloth', 'Button-down collar with natural roll', 'Box pleat at back', 'Mother-of-pearl buttons']::text[], '100% cotton', 'Machine wash 40°C. Iron while damp.', 'Regular fit. True to size.', 8900, null, '1637eb04-47e9-5f3e-92fe-4254d01da77c', 'active', true, false, 77, now() - interval '192 days', now() - interval '192 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('9592c5fd-2111-5b5e-89f2-48fe22e314d5', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?auto=format&fit=crop&w=1600&q=80', 'Oxford Button-Down in light blue', 'Light Blue', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('9592c5fd-2111-5b5e-89f2-48fe22e314d5', 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1600&q=80', 'Oxford Button-Down in light blue', 'Light Blue', 1);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('9592c5fd-2111-5b5e-89f2-48fe22e314d5', 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1600&q=80', 'Oxford Button-Down in white', 'White', 2);
insert into public.product_collections (product_id, collection_id) values ('9592c5fd-2111-5b5e-89f2-48fe22e314d5', '19329b73-5298-5eda-8256-52e60e3b5d3b');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('2941adf0-09c4-56ef-ad43-f94e767c1576', '9592c5fd-2111-5b5e-89f2-48fe22e314d5', 'AT-OBD-LIG-XS', 'Light Blue', '#B9CCE0', 'XS', 0);
update public.inventory set quantity = 20 where variant_id = '2941adf0-09c4-56ef-ad43-f94e767c1576';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('bc4ae669-3cb5-5eca-a12e-a23612bc53e3', '9592c5fd-2111-5b5e-89f2-48fe22e314d5', 'AT-OBD-LIG-S', 'Light Blue', '#B9CCE0', 'S', 1);
update public.inventory set quantity = 0 where variant_id = 'bc4ae669-3cb5-5eca-a12e-a23612bc53e3';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('34d8e1a0-221e-5101-bacc-2a00f8e9f842', '9592c5fd-2111-5b5e-89f2-48fe22e314d5', 'AT-OBD-LIG-M', 'Light Blue', '#B9CCE0', 'M', 2);
update public.inventory set quantity = 0 where variant_id = '34d8e1a0-221e-5101-bacc-2a00f8e9f842';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('b8a490b2-68be-569c-9312-c47b1c2b057d', '9592c5fd-2111-5b5e-89f2-48fe22e314d5', 'AT-OBD-LIG-L', 'Light Blue', '#B9CCE0', 'L', 3);
update public.inventory set quantity = 3 where variant_id = 'b8a490b2-68be-569c-9312-c47b1c2b057d';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('287a1cd9-48b8-50de-9a90-9b721cdc563d', '9592c5fd-2111-5b5e-89f2-48fe22e314d5', 'AT-OBD-LIG-XL', 'Light Blue', '#B9CCE0', 'XL', 4);
update public.inventory set quantity = 7 where variant_id = '287a1cd9-48b8-50de-9a90-9b721cdc563d';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('b7fd61a9-e9e9-5a17-bb19-dfdf4bf950ab', '9592c5fd-2111-5b5e-89f2-48fe22e314d5', 'AT-OBD-WHI-XS', 'White', '#F6F6F3', 'XS', 0);
update public.inventory set quantity = 15 where variant_id = 'b7fd61a9-e9e9-5a17-bb19-dfdf4bf950ab';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('8d0fb304-3504-552e-bd73-87fdaf8d65a7', '9592c5fd-2111-5b5e-89f2-48fe22e314d5', 'AT-OBD-WHI-S', 'White', '#F6F6F3', 'S', 1);
update public.inventory set quantity = 27 where variant_id = '8d0fb304-3504-552e-bd73-87fdaf8d65a7';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('d16ec194-dc86-54a8-a65e-05643a0d21af', '9592c5fd-2111-5b5e-89f2-48fe22e314d5', 'AT-OBD-WHI-M', 'White', '#F6F6F3', 'M', 2);
update public.inventory set quantity = 15 where variant_id = 'd16ec194-dc86-54a8-a65e-05643a0d21af';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('d39f7a2e-f469-56fa-b143-e93ba6ab8231', '9592c5fd-2111-5b5e-89f2-48fe22e314d5', 'AT-OBD-WHI-L', 'White', '#F6F6F3', 'L', 3);
update public.inventory set quantity = 27 where variant_id = 'd39f7a2e-f469-56fa-b143-e93ba6ab8231';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('4fcaa284-d388-5088-96c1-aeb3a5ac8497', '9592c5fd-2111-5b5e-89f2-48fe22e314d5', 'AT-OBD-WHI-XL', 'White', '#F6F6F3', 'XL', 4);
update public.inventory set quantity = 20 where variant_id = '4fcaa284-d388-5088-96c1-aeb3a5ac8497';

-- Chambray Dot Shirt
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('a1e2a118-e696-593c-9e12-eaac4050bc0b', 'chambray-dot-shirt', 'Chambray Dot Shirt', 'A lightweight chambray shirt with a discreet woven dot. Easy to wear open over a tee or buttoned up on its own.', array['Lightweight chambray', 'Woven micro-dot', 'Single chest pocket']::text[], '100% cotton', 'Machine wash 30°C. Warm iron.', 'Regular fit.', 7900, 9900, '1637eb04-47e9-5f3e-92fe-4254d01da77c', 'active', false, false, 35, now() - interval '130 days', now() - interval '130 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('a1e2a118-e696-593c-9e12-eaac4050bc0b', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1600&q=80', 'Chambray Dot Shirt in chambray', 'Chambray', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('a1e2a118-e696-593c-9e12-eaac4050bc0b', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1600&q=80', 'Chambray Dot Shirt — detail', null, 1);
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('6298b2ff-42b9-5980-9a75-5be1575b02db', 'a1e2a118-e696-593c-9e12-eaac4050bc0b', 'AT-CDS-CHA-XS', 'Chambray', '#6E8BAA', 'XS', 0);
update public.inventory set quantity = 1 where variant_id = '6298b2ff-42b9-5980-9a75-5be1575b02db';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('c115e198-3b34-55d0-aa97-2c6f20f596d0', 'a1e2a118-e696-593c-9e12-eaac4050bc0b', 'AT-CDS-CHA-S', 'Chambray', '#6E8BAA', 'S', 1);
update public.inventory set quantity = 12 where variant_id = 'c115e198-3b34-55d0-aa97-2c6f20f596d0';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('eb4df8ff-1f43-57cb-8dfb-522fea984e9f', 'a1e2a118-e696-593c-9e12-eaac4050bc0b', 'AT-CDS-CHA-M', 'Chambray', '#6E8BAA', 'M', 2);
update public.inventory set quantity = 10 where variant_id = 'eb4df8ff-1f43-57cb-8dfb-522fea984e9f';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('5cdd3bdb-5e09-5650-8d0b-6c0838d6ce53', 'a1e2a118-e696-593c-9e12-eaac4050bc0b', 'AT-CDS-CHA-L', 'Chambray', '#6E8BAA', 'L', 3);
update public.inventory set quantity = 18 where variant_id = '5cdd3bdb-5e09-5650-8d0b-6c0838d6ce53';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('6925fa11-4583-5fec-88c3-0eed0dcdb3ce', 'a1e2a118-e696-593c-9e12-eaac4050bc0b', 'AT-CDS-CHA-XL', 'Chambray', '#6E8BAA', 'XL', 4);
update public.inventory set quantity = 21 where variant_id = '6925fa11-4583-5fec-88c3-0eed0dcdb3ce';

-- Technical Bomber Jacket
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('8feaeecc-c0fb-52de-aede-fea6d7ddb4dd', 'technical-bomber-jacket', 'Technical Bomber Jacket', 'A clean, lightweight bomber in a water-repellent technical twill. Concealed zip pockets and a two-way zip keep the silhouette minimal.', array['Water-repellent technical twill', 'Two-way metal zip', 'Concealed zip pockets', 'Ribbed collar, cuffs and hem']::text[], '100% recycled polyamide; lining 100% recycled polyester', 'Machine wash 30°C on delicate. Do not iron.', 'Regular fit. Size up for layering.', 22500, null, '86b179e8-4a51-590e-965e-3cfe76cd5ed7', 'active', true, true, 58, now() - interval '3 days', now() - interval '3 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('8feaeecc-c0fb-52de-aede-fea6d7ddb4dd', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1600&q=80', 'Technical Bomber Jacket in copper', 'Copper', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('8feaeecc-c0fb-52de-aede-fea6d7ddb4dd', 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1600&q=80', 'Technical Bomber Jacket — detail', null, 1);
insert into public.product_collections (product_id, collection_id) values ('8feaeecc-c0fb-52de-aede-fea6d7ddb4dd', '83dcf652-7937-5a8a-be83-45544af4bb0d');
insert into public.product_collections (product_id, collection_id) values ('8feaeecc-c0fb-52de-aede-fea6d7ddb4dd', '54260fdb-5062-5ed6-acac-67b5728e8246');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('9f49bac0-60af-568a-8f2e-b2db34688c04', '8feaeecc-c0fb-52de-aede-fea6d7ddb4dd', 'AT-TBJ-COP-XS', 'Copper', '#A8623F', 'XS', 0);
update public.inventory set quantity = 2 where variant_id = '9f49bac0-60af-568a-8f2e-b2db34688c04';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('b3c9595e-006b-59c1-ba68-a0721e369d07', '8feaeecc-c0fb-52de-aede-fea6d7ddb4dd', 'AT-TBJ-COP-S', 'Copper', '#A8623F', 'S', 1);
update public.inventory set quantity = 10 where variant_id = 'b3c9595e-006b-59c1-ba68-a0721e369d07';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('746cfe84-eda7-5dfa-8947-c197f8a80aff', '8feaeecc-c0fb-52de-aede-fea6d7ddb4dd', 'AT-TBJ-COP-M', 'Copper', '#A8623F', 'M', 2);
update public.inventory set quantity = 23 where variant_id = '746cfe84-eda7-5dfa-8947-c197f8a80aff';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('07e68042-2741-5256-bacd-4acc331c39d7', '8feaeecc-c0fb-52de-aede-fea6d7ddb4dd', 'AT-TBJ-COP-L', 'Copper', '#A8623F', 'L', 3);
update public.inventory set quantity = 2 where variant_id = '07e68042-2741-5256-bacd-4acc331c39d7';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('281355a9-1898-5e99-b5a6-e7a2e75ad65e', '8feaeecc-c0fb-52de-aede-fea6d7ddb4dd', 'AT-TBJ-COP-XL', 'Copper', '#A8623F', 'XL', 4);
update public.inventory set quantity = 27 where variant_id = '281355a9-1898-5e99-b5a6-e7a2e75ad65e';

-- Leather Biker Jacket
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('1a001a05-13f3-52d2-9e37-b3dba951c602', 'leather-biker-jacket', 'Leather Biker Jacket', 'Vegetable-tanned lambskin cut into a pared-back biker. Asymmetric zip, notched lapels and a quilted lining that wears in beautifully.', array['Vegetable-tanned lambskin', 'Asymmetric front zip', 'Quilted cupro lining', 'Zip cuffs']::text[], '100% lambskin leather; lining 100% cupro', 'Specialist leather clean only.', 'Slim fit. Size up for layering over knitwear.', 59500, null, '86b179e8-4a51-590e-965e-3cfe76cd5ed7', 'active', true, false, 83, now() - interval '137 days', now() - interval '137 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('1a001a05-13f3-52d2-9e37-b3dba951c602', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1600&q=80', 'Leather Biker Jacket in black', 'Black', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('1a001a05-13f3-52d2-9e37-b3dba951c602', 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1600&q=80', 'Leather Biker Jacket — detail', null, 1);
insert into public.product_collections (product_id, collection_id) values ('1a001a05-13f3-52d2-9e37-b3dba951c602', '83dcf652-7937-5a8a-be83-45544af4bb0d');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('161ea944-e0b4-57ff-ba57-93945688a771', '1a001a05-13f3-52d2-9e37-b3dba951c602', 'AT-LBJ-BLA-XS', 'Black', '#151515', 'XS', 0);
update public.inventory set quantity = 0 where variant_id = '161ea944-e0b4-57ff-ba57-93945688a771';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('ace2a3cf-c82e-5d27-b679-f30ff23aec68', '1a001a05-13f3-52d2-9e37-b3dba951c602', 'AT-LBJ-BLA-S', 'Black', '#151515', 'S', 1);
update public.inventory set quantity = 0 where variant_id = 'ace2a3cf-c82e-5d27-b679-f30ff23aec68';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('284b29a4-86d7-5c51-90a8-e7325f2c8547', '1a001a05-13f3-52d2-9e37-b3dba951c602', 'AT-LBJ-BLA-M', 'Black', '#151515', 'M', 2);
update public.inventory set quantity = 0 where variant_id = '284b29a4-86d7-5c51-90a8-e7325f2c8547';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('21f06725-8379-52be-af54-09bdad84958e', '1a001a05-13f3-52d2-9e37-b3dba951c602', 'AT-LBJ-BLA-L', 'Black', '#151515', 'L', 3);
update public.inventory set quantity = 0 where variant_id = '21f06725-8379-52be-af54-09bdad84958e';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('43251c20-754c-5476-8bb0-5a558c663726', '1a001a05-13f3-52d2-9e37-b3dba951c602', 'AT-LBJ-BLA-XL', 'Black', '#151515', 'XL', 4);
update public.inventory set quantity = 0 where variant_id = '43251c20-754c-5476-8bb0-5a558c663726';

-- Waxed Field Parka
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('89aa0b7a-efd0-536a-b3d3-66301e60a183', 'waxed-field-parka', 'Waxed Field Parka', 'A four-pocket field parka in waxed cotton, built for wet city days. A storm flap, adjustable hood and drawcord waist let you shape it to the weather.', array['Waxed cotton canvas', 'Packable hood', 'Four bellows pockets', 'Drawcord waist']::text[], '100% cotton with paraffin wax finish', 'Do not wash. Wipe clean and re-wax as needed.', 'Relaxed fit. True to size.', 34500, null, '86b179e8-4a51-590e-965e-3cfe76cd5ed7', 'active', false, true, 49, now() - interval '16 days', now() - interval '16 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('89aa0b7a-efd0-536a-b3d3-66301e60a183', 'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=1600&q=80', 'Waxed Field Parka in olive', 'Olive', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('89aa0b7a-efd0-536a-b3d3-66301e60a183', 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1600&q=80', 'Waxed Field Parka in olive', 'Olive', 1);
insert into public.product_collections (product_id, collection_id) values ('89aa0b7a-efd0-536a-b3d3-66301e60a183', '83dcf652-7937-5a8a-be83-45544af4bb0d');
insert into public.product_collections (product_id, collection_id) values ('89aa0b7a-efd0-536a-b3d3-66301e60a183', '54260fdb-5062-5ed6-acac-67b5728e8246');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('307bdbe9-5ebe-597f-b7ff-04bb897f5de0', '89aa0b7a-efd0-536a-b3d3-66301e60a183', 'AT-WFP-OLI-XS', 'Olive', '#5B5A3A', 'XS', 0);
update public.inventory set quantity = 11 where variant_id = '307bdbe9-5ebe-597f-b7ff-04bb897f5de0';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('b2a63c7c-9b84-5698-9361-9958583c1294', '89aa0b7a-efd0-536a-b3d3-66301e60a183', 'AT-WFP-OLI-S', 'Olive', '#5B5A3A', 'S', 1);
update public.inventory set quantity = 1 where variant_id = 'b2a63c7c-9b84-5698-9361-9958583c1294';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('563e8068-045e-558c-85aa-4efba84f3663', '89aa0b7a-efd0-536a-b3d3-66301e60a183', 'AT-WFP-OLI-M', 'Olive', '#5B5A3A', 'M', 2);
update public.inventory set quantity = 3 where variant_id = '563e8068-045e-558c-85aa-4efba84f3663';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('6af3a7f0-cda5-572a-8c7b-02f0a31b7a80', '89aa0b7a-efd0-536a-b3d3-66301e60a183', 'AT-WFP-OLI-L', 'Olive', '#5B5A3A', 'L', 3);
update public.inventory set quantity = 24 where variant_id = '6af3a7f0-cda5-572a-8c7b-02f0a31b7a80';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('1c74fb5e-08f1-5a61-a106-0b2a5ee7e84e', '89aa0b7a-efd0-536a-b3d3-66301e60a183', 'AT-WFP-OLI-XL', 'Olive', '#5B5A3A', 'XL', 4);
update public.inventory set quantity = 10 where variant_id = '1c74fb5e-08f1-5a61-a106-0b2a5ee7e84e';

-- Belted Wool Coat
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('c4aa4adb-0184-586e-8490-d4e1e55d4471', 'belted-wool-coat', 'Belted Wool Coat', 'A long, unstructured wrap coat in double-faced wool. No lining, no padding — just a soft, fluid drape and a removable belt.', array['Double-faced wool', 'Unlined, hand-finished seams', 'Removable tie belt', 'Welt pockets']::text[], '90% wool, 10% cashmere', 'Dry clean only.', 'Relaxed, oversized fit.', 39500, null, '86b179e8-4a51-590e-965e-3cfe76cd5ed7', 'active', true, false, 67, now() - interval '171 days', now() - interval '171 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('c4aa4adb-0184-586e-8490-d4e1e55d4471', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1600&q=80', 'Belted Wool Coat in camel', 'Camel', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('c4aa4adb-0184-586e-8490-d4e1e55d4471', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80', 'Belted Wool Coat in burgundy', 'Burgundy', 1);
insert into public.product_collections (product_id, collection_id) values ('c4aa4adb-0184-586e-8490-d4e1e55d4471', '83dcf652-7937-5a8a-be83-45544af4bb0d');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('ffacd799-8d4b-5e8c-be38-69be5299ee1f', 'c4aa4adb-0184-586e-8490-d4e1e55d4471', 'AT-BWC-CAM-XS', 'Camel', '#B7875A', 'XS', 0);
update public.inventory set quantity = 26 where variant_id = 'ffacd799-8d4b-5e8c-be38-69be5299ee1f';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('72456010-5d83-5c92-a2a8-7648da8f666f', 'c4aa4adb-0184-586e-8490-d4e1e55d4471', 'AT-BWC-CAM-S', 'Camel', '#B7875A', 'S', 1);
update public.inventory set quantity = 7 where variant_id = '72456010-5d83-5c92-a2a8-7648da8f666f';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('a05ce20c-6f99-5ef1-aec7-f010175db026', 'c4aa4adb-0184-586e-8490-d4e1e55d4471', 'AT-BWC-CAM-M', 'Camel', '#B7875A', 'M', 2);
update public.inventory set quantity = 30 where variant_id = 'a05ce20c-6f99-5ef1-aec7-f010175db026';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('e07ae36e-45c8-5b50-a0a6-a7d2d2280c3d', 'c4aa4adb-0184-586e-8490-d4e1e55d4471', 'AT-BWC-CAM-L', 'Camel', '#B7875A', 'L', 3);
update public.inventory set quantity = 27 where variant_id = 'e07ae36e-45c8-5b50-a0a6-a7d2d2280c3d';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('28af946d-c4b2-5e1e-b82d-1ffd8f077d00', 'c4aa4adb-0184-586e-8490-d4e1e55d4471', 'AT-BWC-CAM-XL', 'Camel', '#B7875A', 'XL', 4);
update public.inventory set quantity = 18 where variant_id = '28af946d-c4b2-5e1e-b82d-1ffd8f077d00';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('d4641a18-8ac5-5b27-a4a7-b83c2023c191', 'c4aa4adb-0184-586e-8490-d4e1e55d4471', 'AT-BWC-BUR-XS', 'Burgundy', '#6B1F2A', 'XS', 0);
update public.inventory set quantity = 18 where variant_id = 'd4641a18-8ac5-5b27-a4a7-b83c2023c191';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('8b34f59e-e8ec-5232-bcb2-3ff801dcfc51', 'c4aa4adb-0184-586e-8490-d4e1e55d4471', 'AT-BWC-BUR-S', 'Burgundy', '#6B1F2A', 'S', 1);
update public.inventory set quantity = 0 where variant_id = '8b34f59e-e8ec-5232-bcb2-3ff801dcfc51';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('ff469098-ceee-5cb0-ba9a-8c8ebcb7047a', 'c4aa4adb-0184-586e-8490-d4e1e55d4471', 'AT-BWC-BUR-M', 'Burgundy', '#6B1F2A', 'M', 2);
update public.inventory set quantity = 7 where variant_id = 'ff469098-ceee-5cb0-ba9a-8c8ebcb7047a';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('07a044fd-45b0-5bbe-8f28-3ff188042db4', 'c4aa4adb-0184-586e-8490-d4e1e55d4471', 'AT-BWC-BUR-L', 'Burgundy', '#6B1F2A', 'L', 3);
update public.inventory set quantity = 1 where variant_id = '07a044fd-45b0-5bbe-8f28-3ff188042db4';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('eb69a2ef-add0-5d79-bf2b-591c40ebf968', 'c4aa4adb-0184-586e-8490-d4e1e55d4471', 'AT-BWC-BUR-XL', 'Burgundy', '#6B1F2A', 'XL', 4);
update public.inventory set quantity = 9 where variant_id = 'eb69a2ef-add0-5d79-bf2b-591c40ebf968';

-- Selvedge Denim Jacket
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('aac7c984-ceeb-50db-83f2-4ddd68f7a6c1', 'selvedge-denim-jacket', 'Selvedge Denim Jacket', 'A classic trucker jacket reworked with a cleaner front and a slightly longer body. Cut from 13.5 oz Japanese selvedge denim.', array['13.5 oz selvedge denim', 'Corduroy collar', 'Antique brass buttons']::text[], '100% cotton', 'Wash sparingly, cold, inside out.', 'Regular fit.', 18500, null, '86b179e8-4a51-590e-965e-3cfe76cd5ed7', 'active', false, false, 52, now() - interval '127 days', now() - interval '127 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('aac7c984-ceeb-50db-83f2-4ddd68f7a6c1', 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?auto=format&fit=crop&w=1600&q=80', 'Selvedge Denim Jacket in indigo', 'Indigo', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('aac7c984-ceeb-50db-83f2-4ddd68f7a6c1', 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=1600&q=80', 'Selvedge Denim Jacket in light wash', 'Light Wash', 1);
insert into public.product_collections (product_id, collection_id) values ('aac7c984-ceeb-50db-83f2-4ddd68f7a6c1', '83dcf652-7937-5a8a-be83-45544af4bb0d');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('ff2be34b-2430-596c-80a1-eedd681fe3d9', 'aac7c984-ceeb-50db-83f2-4ddd68f7a6c1', 'AT-SDJ-IND-XS', 'Indigo', '#2E3B55', 'XS', 0);
update public.inventory set quantity = 9 where variant_id = 'ff2be34b-2430-596c-80a1-eedd681fe3d9';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('29ae8a2e-ac74-505f-99c0-6490577f39bd', 'aac7c984-ceeb-50db-83f2-4ddd68f7a6c1', 'AT-SDJ-IND-S', 'Indigo', '#2E3B55', 'S', 1);
update public.inventory set quantity = 0 where variant_id = '29ae8a2e-ac74-505f-99c0-6490577f39bd';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('d687c1ef-709e-51a5-98be-1e608031599b', 'aac7c984-ceeb-50db-83f2-4ddd68f7a6c1', 'AT-SDJ-IND-M', 'Indigo', '#2E3B55', 'M', 2);
update public.inventory set quantity = 1 where variant_id = 'd687c1ef-709e-51a5-98be-1e608031599b';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('c3ade38c-e20a-5b87-b183-82c8d58d2239', 'aac7c984-ceeb-50db-83f2-4ddd68f7a6c1', 'AT-SDJ-IND-L', 'Indigo', '#2E3B55', 'L', 3);
update public.inventory set quantity = 25 where variant_id = 'c3ade38c-e20a-5b87-b183-82c8d58d2239';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('6a7097cc-ee56-5327-b19b-9e3ebc0926bf', 'aac7c984-ceeb-50db-83f2-4ddd68f7a6c1', 'AT-SDJ-IND-XL', 'Indigo', '#2E3B55', 'XL', 4);
update public.inventory set quantity = 0 where variant_id = '6a7097cc-ee56-5327-b19b-9e3ebc0926bf';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('cbe2cccf-108c-5093-8ca9-07c44b3d6a11', 'aac7c984-ceeb-50db-83f2-4ddd68f7a6c1', 'AT-SDJ-LIG-XS', 'Light Wash', '#9DB6D0', 'XS', 0);
update public.inventory set quantity = 25 where variant_id = 'cbe2cccf-108c-5093-8ca9-07c44b3d6a11';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('9a0f5812-286f-58bd-8f49-528f20ac9682', 'aac7c984-ceeb-50db-83f2-4ddd68f7a6c1', 'AT-SDJ-LIG-S', 'Light Wash', '#9DB6D0', 'S', 1);
update public.inventory set quantity = 26 where variant_id = '9a0f5812-286f-58bd-8f49-528f20ac9682';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('7384489e-fe98-5abb-b734-1ce0aab75ca0', 'aac7c984-ceeb-50db-83f2-4ddd68f7a6c1', 'AT-SDJ-LIG-M', 'Light Wash', '#9DB6D0', 'M', 2);
update public.inventory set quantity = 2 where variant_id = '7384489e-fe98-5abb-b734-1ce0aab75ca0';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('957b6ecb-9629-5e6e-a62c-24eeb5b52c3f', 'aac7c984-ceeb-50db-83f2-4ddd68f7a6c1', 'AT-SDJ-LIG-L', 'Light Wash', '#9DB6D0', 'L', 3);
update public.inventory set quantity = 21 where variant_id = '957b6ecb-9629-5e6e-a62c-24eeb5b52c3f';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('1a85201d-ab74-5cac-bacc-8d2715148282', 'aac7c984-ceeb-50db-83f2-4ddd68f7a6c1', 'AT-SDJ-LIG-XL', 'Light Wash', '#9DB6D0', 'XL', 4);
update public.inventory set quantity = 2 where variant_id = '1a85201d-ab74-5cac-bacc-8d2715148282';

-- Tailored Wool Blazer
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('e738e26b-6435-52c4-aef4-1b1fe59294b8', 'tailored-wool-blazer', 'Tailored Wool Blazer', 'A soft-shouldered, half-canvassed blazer in a light wool twill. Designed to be worn with denim as easily as with tailored trousers.', array['Half-canvassed construction', 'Soft natural shoulder', 'Two-button closure', 'Patch pockets']::text[], '100% wool; lining 100% cupro', 'Dry clean only.', 'Regular fit. True to size.', 32500, null, '86b179e8-4a51-590e-965e-3cfe76cd5ed7', 'active', false, true, 44, now() - interval '15 days', now() - interval '15 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('e738e26b-6435-52c4-aef4-1b1fe59294b8', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80', 'Tailored Wool Blazer in navy', 'Navy', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('e738e26b-6435-52c4-aef4-1b1fe59294b8', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1600&q=80', 'Tailored Wool Blazer in navy', 'Navy', 1);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('e738e26b-6435-52c4-aef4-1b1fe59294b8', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1600&q=80', 'Tailored Wool Blazer in black', 'Black', 2);
insert into public.product_collections (product_id, collection_id) values ('e738e26b-6435-52c4-aef4-1b1fe59294b8', '83dcf652-7937-5a8a-be83-45544af4bb0d');
insert into public.product_collections (product_id, collection_id) values ('e738e26b-6435-52c4-aef4-1b1fe59294b8', '54260fdb-5062-5ed6-acac-67b5728e8246');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('0100c3cd-053f-5e8f-9b9b-9382a787024b', 'e738e26b-6435-52c4-aef4-1b1fe59294b8', 'AT-TWB-NAV-XS', 'Navy', '#1F2A44', 'XS', 0);
update public.inventory set quantity = 15 where variant_id = '0100c3cd-053f-5e8f-9b9b-9382a787024b';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('5a394ea2-2f42-56dd-8e83-53fcd9ece2da', 'e738e26b-6435-52c4-aef4-1b1fe59294b8', 'AT-TWB-NAV-S', 'Navy', '#1F2A44', 'S', 1);
update public.inventory set quantity = 0 where variant_id = '5a394ea2-2f42-56dd-8e83-53fcd9ece2da';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('76ee2170-77c4-528d-89b4-f14a8788b15e', 'e738e26b-6435-52c4-aef4-1b1fe59294b8', 'AT-TWB-NAV-M', 'Navy', '#1F2A44', 'M', 2);
update public.inventory set quantity = 0 where variant_id = '76ee2170-77c4-528d-89b4-f14a8788b15e';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('55a36281-79a7-5176-8c7e-0b35c3d5f43f', 'e738e26b-6435-52c4-aef4-1b1fe59294b8', 'AT-TWB-NAV-L', 'Navy', '#1F2A44', 'L', 3);
update public.inventory set quantity = 14 where variant_id = '55a36281-79a7-5176-8c7e-0b35c3d5f43f';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('07546275-24d5-507d-acad-cf40b3f7987b', 'e738e26b-6435-52c4-aef4-1b1fe59294b8', 'AT-TWB-NAV-XL', 'Navy', '#1F2A44', 'XL', 4);
update public.inventory set quantity = 28 where variant_id = '07546275-24d5-507d-acad-cf40b3f7987b';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('f27de75f-2db2-55b0-865a-ff2ec453216e', 'e738e26b-6435-52c4-aef4-1b1fe59294b8', 'AT-TWB-BLA-XS', 'Black', '#141414', 'XS', 0);
update public.inventory set quantity = 1 where variant_id = 'f27de75f-2db2-55b0-865a-ff2ec453216e';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('ff31dd79-9d4a-5fb6-b0be-17d6860a2bc9', 'e738e26b-6435-52c4-aef4-1b1fe59294b8', 'AT-TWB-BLA-S', 'Black', '#141414', 'S', 1);
update public.inventory set quantity = 3 where variant_id = 'ff31dd79-9d4a-5fb6-b0be-17d6860a2bc9';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('298427bd-00dd-50aa-b79c-dcc06f0044fd', 'e738e26b-6435-52c4-aef4-1b1fe59294b8', 'AT-TWB-BLA-M', 'Black', '#141414', 'M', 2);
update public.inventory set quantity = 28 where variant_id = '298427bd-00dd-50aa-b79c-dcc06f0044fd';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('65bf182c-c8b0-5f54-9a82-a71e8217c878', 'e738e26b-6435-52c4-aef4-1b1fe59294b8', 'AT-TWB-BLA-L', 'Black', '#141414', 'L', 3);
update public.inventory set quantity = 6 where variant_id = '65bf182c-c8b0-5f54-9a82-a71e8217c878';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('9e89ed71-05dd-5f10-a81a-b234159c7e78', 'e738e26b-6435-52c4-aef4-1b1fe59294b8', 'AT-TWB-BLA-XL', 'Black', '#141414', 'XL', 4);
update public.inventory set quantity = 15 where variant_id = '9e89ed71-05dd-5f10-a81a-b234159c7e78';

-- Check Wool Overcoat
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('85f52240-af45-5df9-8acb-7b4dc2feeaee', 'check-wool-overcoat', 'Check Wool Overcoat', 'A boxy, mid-length overcoat in a brushed wool check. Dropped shoulders and a hidden placket keep it relaxed and modern.', array['Brushed wool check', 'Concealed placket', 'Dropped shoulder', 'Side seam pockets']::text[], '70% wool, 30% recycled polyamide', 'Dry clean only.', 'Oversized fit. Size down for a regular fit.', 29500, null, '86b179e8-4a51-590e-965e-3cfe76cd5ed7', 'active', false, true, 38, now() - interval '3 days', now() - interval '3 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('85f52240-af45-5df9-8acb-7b4dc2feeaee', 'https://images.unsplash.com/photo-1525450824786-227cbef70703?auto=format&fit=crop&w=1600&q=80', 'Check Wool Overcoat in houndstooth', 'Houndstooth', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('85f52240-af45-5df9-8acb-7b4dc2feeaee', 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1600&q=80', 'Check Wool Overcoat in forest check', 'Forest Check', 1);
insert into public.product_collections (product_id, collection_id) values ('85f52240-af45-5df9-8acb-7b4dc2feeaee', '83dcf652-7937-5a8a-be83-45544af4bb0d');
insert into public.product_collections (product_id, collection_id) values ('85f52240-af45-5df9-8acb-7b4dc2feeaee', '54260fdb-5062-5ed6-acac-67b5728e8246');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('4bcec759-adde-54d3-a32c-170b9cb9ecf3', '85f52240-af45-5df9-8acb-7b4dc2feeaee', 'AT-CWO-HOU-XS', 'Houndstooth', '#3A3A3A', 'XS', 0);
update public.inventory set quantity = 14 where variant_id = '4bcec759-adde-54d3-a32c-170b9cb9ecf3';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('9126e4f4-1cc2-5f79-b2da-cef672b85602', '85f52240-af45-5df9-8acb-7b4dc2feeaee', 'AT-CWO-HOU-S', 'Houndstooth', '#3A3A3A', 'S', 1);
update public.inventory set quantity = 11 where variant_id = '9126e4f4-1cc2-5f79-b2da-cef672b85602';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('23168aaa-7d2d-57ef-97c8-36ba4861fe55', '85f52240-af45-5df9-8acb-7b4dc2feeaee', 'AT-CWO-HOU-M', 'Houndstooth', '#3A3A3A', 'M', 2);
update public.inventory set quantity = 13 where variant_id = '23168aaa-7d2d-57ef-97c8-36ba4861fe55';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('36852a32-a136-5fa8-8098-67b7d6638c11', '85f52240-af45-5df9-8acb-7b4dc2feeaee', 'AT-CWO-HOU-L', 'Houndstooth', '#3A3A3A', 'L', 3);
update public.inventory set quantity = 30 where variant_id = '36852a32-a136-5fa8-8098-67b7d6638c11';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('cdd15bea-4baa-52ab-96e4-d1157a18b8ab', '85f52240-af45-5df9-8acb-7b4dc2feeaee', 'AT-CWO-HOU-XL', 'Houndstooth', '#3A3A3A', 'XL', 4);
update public.inventory set quantity = 26 where variant_id = 'cdd15bea-4baa-52ab-96e4-d1157a18b8ab';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('63b59998-ac25-56c4-9761-49579fb980c8', '85f52240-af45-5df9-8acb-7b4dc2feeaee', 'AT-CWO-FOR-XS', 'Forest Check', '#2F3D33', 'XS', 0);
update public.inventory set quantity = 1 where variant_id = '63b59998-ac25-56c4-9761-49579fb980c8';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('ae801106-fa15-5bc2-8477-ea9a15f5b583', '85f52240-af45-5df9-8acb-7b4dc2feeaee', 'AT-CWO-FOR-S', 'Forest Check', '#2F3D33', 'S', 1);
update public.inventory set quantity = 18 where variant_id = 'ae801106-fa15-5bc2-8477-ea9a15f5b583';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('9f3a4e69-d3a0-5678-81ea-f1cfe8ab976f', '85f52240-af45-5df9-8acb-7b4dc2feeaee', 'AT-CWO-FOR-M', 'Forest Check', '#2F3D33', 'M', 2);
update public.inventory set quantity = 13 where variant_id = '9f3a4e69-d3a0-5678-81ea-f1cfe8ab976f';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('ec04c8a1-faf0-512a-a5ca-946ba6631d2e', '85f52240-af45-5df9-8acb-7b4dc2feeaee', 'AT-CWO-FOR-L', 'Forest Check', '#2F3D33', 'L', 3);
update public.inventory set quantity = 2 where variant_id = 'ec04c8a1-faf0-512a-a5ca-946ba6631d2e';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('8d2be935-a92b-510b-9950-a4e739e11980', '85f52240-af45-5df9-8acb-7b4dc2feeaee', 'AT-CWO-FOR-XL', 'Forest Check', '#2F3D33', 'XL', 4);
update public.inventory set quantity = 6 where variant_id = '8d2be935-a92b-510b-9950-a4e739e11980';

-- Straight Raw Denim
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('491dd47a-a15c-5c40-b79b-7497eb04893c', 'straight-raw-denim', 'Straight Raw Denim', 'A mid-rise straight leg in unwashed 14 oz denim. It will fade to your shape — start with the size you wear and let it relax.', array['14 oz raw denim', 'Button fly', 'Mid rise, straight leg', 'Chain-stitched hem']::text[], '100% cotton', 'Wear for months before first wash. Wash cold, inside out.', 'Straight fit. True to waist size.', 13500, null, 'a72d8e7d-6040-5189-a586-8fe723d35e70', 'active', true, false, 81, now() - interval '47 days', now() - interval '47 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('491dd47a-a15c-5c40-b79b-7497eb04893c', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1600&q=80', 'Straight Raw Denim in raw indigo', 'Raw Indigo', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('491dd47a-a15c-5c40-b79b-7497eb04893c', 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1600&q=80', 'Straight Raw Denim — detail', null, 1);
insert into public.product_collections (product_id, collection_id) values ('491dd47a-a15c-5c40-b79b-7497eb04893c', '19329b73-5298-5eda-8256-52e60e3b5d3b');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('ad8ed3af-4139-59f3-962b-abb53c338e7b', '491dd47a-a15c-5c40-b79b-7497eb04893c', 'AT-SRD-RAW-28', 'Raw Indigo', '#1E2638', '28', 0);
update public.inventory set quantity = 21 where variant_id = 'ad8ed3af-4139-59f3-962b-abb53c338e7b';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('aed52a04-7e47-5e20-a3ea-c23fab4354c7', '491dd47a-a15c-5c40-b79b-7497eb04893c', 'AT-SRD-RAW-30', 'Raw Indigo', '#1E2638', '30', 1);
update public.inventory set quantity = 3 where variant_id = 'aed52a04-7e47-5e20-a3ea-c23fab4354c7';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('382f3949-0ca5-52d1-8fa9-21fc96065070', '491dd47a-a15c-5c40-b79b-7497eb04893c', 'AT-SRD-RAW-32', 'Raw Indigo', '#1E2638', '32', 2);
update public.inventory set quantity = 17 where variant_id = '382f3949-0ca5-52d1-8fa9-21fc96065070';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('bd18f308-daa8-5811-82dd-4b71e7410a3e', '491dd47a-a15c-5c40-b79b-7497eb04893c', 'AT-SRD-RAW-34', 'Raw Indigo', '#1E2638', '34', 3);
update public.inventory set quantity = 29 where variant_id = 'bd18f308-daa8-5811-82dd-4b71e7410a3e';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('67a6ef9e-997d-5cba-b3ef-f5edf85a5b48', '491dd47a-a15c-5c40-b79b-7497eb04893c', 'AT-SRD-RAW-36', 'Raw Indigo', '#1E2638', '36', 4);
update public.inventory set quantity = 17 where variant_id = '67a6ef9e-997d-5cba-b3ef-f5edf85a5b48';

-- Tapered Chino
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('cf43c3a3-387e-5d3f-abdf-0fae74883766', 'tapered-chino', 'Tapered Chino', 'A modern chino in brushed cotton twill with a gentle taper. Clean front, slanted pockets and a half-elastic back waist for comfort.', array['Brushed cotton twill', 'Half-elastic back waist', 'Slanted front pockets', 'Tapered leg']::text[], '98% cotton, 2% elastane', 'Machine wash 30°C. Warm iron.', 'Tapered fit. True to waist size.', 11000, null, 'a72d8e7d-6040-5189-a586-8fe723d35e70', 'active', false, false, 60, now() - interval '60 days', now() - interval '60 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('cf43c3a3-387e-5d3f-abdf-0fae74883766', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1600&q=80', 'Tapered Chino in khaki', 'Khaki', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('cf43c3a3-387e-5d3f-abdf-0fae74883766', 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1600&q=80', 'Tapered Chino in ecru', 'Ecru', 1);
insert into public.product_collections (product_id, collection_id) values ('cf43c3a3-387e-5d3f-abdf-0fae74883766', '19329b73-5298-5eda-8256-52e60e3b5d3b');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('76b2e8bb-81c7-59bd-89be-4a2b63310e01', 'cf43c3a3-387e-5d3f-abdf-0fae74883766', 'AT-TC-KHA-28', 'Khaki', '#B7A27F', '28', 0);
update public.inventory set quantity = 1 where variant_id = '76b2e8bb-81c7-59bd-89be-4a2b63310e01';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('aef42fb1-baa7-572a-9b2b-fd5825fbc641', 'cf43c3a3-387e-5d3f-abdf-0fae74883766', 'AT-TC-KHA-30', 'Khaki', '#B7A27F', '30', 1);
update public.inventory set quantity = 16 where variant_id = 'aef42fb1-baa7-572a-9b2b-fd5825fbc641';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('fc6b6c73-c6da-5c49-8e39-3feb55b10999', 'cf43c3a3-387e-5d3f-abdf-0fae74883766', 'AT-TC-KHA-32', 'Khaki', '#B7A27F', '32', 2);
update public.inventory set quantity = 3 where variant_id = 'fc6b6c73-c6da-5c49-8e39-3feb55b10999';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('1d2e9793-1a00-5831-a13f-b89abdf6186e', 'cf43c3a3-387e-5d3f-abdf-0fae74883766', 'AT-TC-KHA-34', 'Khaki', '#B7A27F', '34', 3);
update public.inventory set quantity = 25 where variant_id = '1d2e9793-1a00-5831-a13f-b89abdf6186e';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('7784bf16-d08f-585d-9ff4-49ca4616fe8b', 'cf43c3a3-387e-5d3f-abdf-0fae74883766', 'AT-TC-KHA-36', 'Khaki', '#B7A27F', '36', 4);
update public.inventory set quantity = 21 where variant_id = '7784bf16-d08f-585d-9ff4-49ca4616fe8b';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('608e9a7d-bb56-583b-86d8-3231ad4f243f', 'cf43c3a3-387e-5d3f-abdf-0fae74883766', 'AT-TC-ECR-28', 'Ecru', '#E6E0D2', '28', 0);
update public.inventory set quantity = 17 where variant_id = '608e9a7d-bb56-583b-86d8-3231ad4f243f';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('0ee6a938-50e4-57b0-a646-d02082a45e21', 'cf43c3a3-387e-5d3f-abdf-0fae74883766', 'AT-TC-ECR-30', 'Ecru', '#E6E0D2', '30', 1);
update public.inventory set quantity = 8 where variant_id = '0ee6a938-50e4-57b0-a646-d02082a45e21';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('f000171e-5b24-53fa-ac5a-47b37134399f', 'cf43c3a3-387e-5d3f-abdf-0fae74883766', 'AT-TC-ECR-32', 'Ecru', '#E6E0D2', '32', 2);
update public.inventory set quantity = 9 where variant_id = 'f000171e-5b24-53fa-ac5a-47b37134399f';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('4aa2f48e-fb83-5596-8a8f-2bee8669a221', 'cf43c3a3-387e-5d3f-abdf-0fae74883766', 'AT-TC-ECR-34', 'Ecru', '#E6E0D2', '34', 3);
update public.inventory set quantity = 28 where variant_id = '4aa2f48e-fb83-5596-8a8f-2bee8669a221';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('d07a3e24-93f2-5995-b8e3-54594063306e', 'cf43c3a3-387e-5d3f-abdf-0fae74883766', 'AT-TC-ECR-36', 'Ecru', '#E6E0D2', '36', 4);
update public.inventory set quantity = 21 where variant_id = 'd07a3e24-93f2-5995-b8e3-54594063306e';

-- Pleated Wide Trouser
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('9b247c4c-e1e9-5106-ad16-254ed17da7ad', 'pleated-wide-trouser', 'Pleated Wide Trouser', 'A fluid, high-waisted trouser with deep front pleats and a cuffed ankle. Cut from a soft, drapey twill that moves with you.', array['Fluid twill', 'Double front pleats', 'Elasticated cuff', 'Concealed side zip']::text[], '70% lyocell, 30% linen', 'Machine wash 30°C on delicate. Low iron.', 'Wide fit, high rise.', 14500, null, 'a72d8e7d-6040-5189-a586-8fe723d35e70', 'active', false, true, 29, now() - interval '6 days', now() - interval '6 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('9b247c4c-e1e9-5106-ad16-254ed17da7ad', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1600&q=80', 'Pleated Wide Trouser in dusty rose', 'Dusty Rose', 0);
insert into public.product_collections (product_id, collection_id) values ('9b247c4c-e1e9-5106-ad16-254ed17da7ad', '54260fdb-5062-5ed6-acac-67b5728e8246');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('c6689125-4062-560c-9483-477e99a83a96', '9b247c4c-e1e9-5106-ad16-254ed17da7ad', 'AT-PWT-DUS-28', 'Dusty Rose', '#D8B4A6', '28', 0);
update public.inventory set quantity = 26 where variant_id = 'c6689125-4062-560c-9483-477e99a83a96';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('0ca79cd6-1169-5f20-9990-c9e5e412c1b8', '9b247c4c-e1e9-5106-ad16-254ed17da7ad', 'AT-PWT-DUS-30', 'Dusty Rose', '#D8B4A6', '30', 1);
update public.inventory set quantity = 29 where variant_id = '0ca79cd6-1169-5f20-9990-c9e5e412c1b8';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('1fbaa0df-1cf2-5616-bce8-922aa15cbefe', '9b247c4c-e1e9-5106-ad16-254ed17da7ad', 'AT-PWT-DUS-32', 'Dusty Rose', '#D8B4A6', '32', 2);
update public.inventory set quantity = 18 where variant_id = '1fbaa0df-1cf2-5616-bce8-922aa15cbefe';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('73eccd18-92ea-5cb8-8112-f08b819765d9', '9b247c4c-e1e9-5106-ad16-254ed17da7ad', 'AT-PWT-DUS-34', 'Dusty Rose', '#D8B4A6', '34', 3);
update public.inventory set quantity = 8 where variant_id = '73eccd18-92ea-5cb8-8112-f08b819765d9';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('5c5bca9a-33ae-5d41-a02d-413ff3820005', '9b247c4c-e1e9-5106-ad16-254ed17da7ad', 'AT-PWT-DUS-36', 'Dusty Rose', '#D8B4A6', '36', 4);
update public.inventory set quantity = 11 where variant_id = '5c5bca9a-33ae-5d41-a02d-413ff3820005';

-- Washed Twill Cap
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('60dafa0b-1dd5-566c-8b36-21c70a0fa7dd', 'washed-twill-cap', 'Washed Twill Cap', 'A six-panel cap in garment-washed cotton twill with a soft, unstructured crown and an adjustable strap.', array['Garment-washed twill', 'Unstructured six-panel crown', 'Adjustable strap with metal buckle']::text[], '100% cotton', 'Hand wash cold. Reshape and air dry.', 'One size, adjustable.', 3900, null, '11d2c2c1-c1ff-5495-a6b0-83e50bd9030a', 'active', false, true, 55, now() - interval '5 days', now() - interval '5 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('60dafa0b-1dd5-566c-8b36-21c70a0fa7dd', 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1600&q=80', 'Washed Twill Cap in charcoal', 'Charcoal', 0);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('60dafa0b-1dd5-566c-8b36-21c70a0fa7dd', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1600&q=80', 'Washed Twill Cap in white', 'White', 1);
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('60dafa0b-1dd5-566c-8b36-21c70a0fa7dd', 'https://images.unsplash.com/photo-1622445275576-721325763afe?auto=format&fit=crop&w=1600&q=80', 'Washed Twill Cap in white', 'White', 2);
insert into public.product_collections (product_id, collection_id) values ('60dafa0b-1dd5-566c-8b36-21c70a0fa7dd', '5c5a5715-0d35-5744-a937-c0be7a173817');
insert into public.product_collections (product_id, collection_id) values ('60dafa0b-1dd5-566c-8b36-21c70a0fa7dd', '54260fdb-5062-5ed6-acac-67b5728e8246');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('a11ea1a4-34a4-5c85-a96c-97e3dc09b3c0', '60dafa0b-1dd5-566c-8b36-21c70a0fa7dd', 'AT-WTC-CHA-ONE', 'Charcoal', '#4A4D52', 'One Size', 0);
update public.inventory set quantity = 0 where variant_id = 'a11ea1a4-34a4-5c85-a96c-97e3dc09b3c0';
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('9041c1ed-f1ca-5508-9182-24ed81151125', '60dafa0b-1dd5-566c-8b36-21c70a0fa7dd', 'AT-WTC-WHI-ONE', 'White', '#F5F5F2', 'One Size', 0);
update public.inventory set quantity = 20 where variant_id = '9041c1ed-f1ca-5508-9182-24ed81151125';

-- Everyday Backpack
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('9bcac2bb-3f6f-5949-998b-837ee10f28f7', 'everyday-backpack', 'Everyday Backpack', 'A slim, structured backpack with a padded 16" laptop sleeve and a quick-access front pocket. Water-resistant recycled nylon throughout.', array['Water-resistant recycled nylon', 'Padded 16" laptop sleeve', 'Leather-trimmed straps', '18 L capacity']::text[], '100% recycled nylon; leather trims', 'Spot clean with a damp cloth.', 'H 44 × W 30 × D 13 cm', 16500, null, '11d2c2c1-c1ff-5495-a6b0-83e50bd9030a', 'active', false, false, 47, now() - interval '77 days', now() - interval '77 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('9bcac2bb-3f6f-5949-998b-837ee10f28f7', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1600&q=80', 'Everyday Backpack in navy', 'Navy', 0);
insert into public.product_collections (product_id, collection_id) values ('9bcac2bb-3f6f-5949-998b-837ee10f28f7', '5c5a5715-0d35-5744-a937-c0be7a173817');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('67bfcadc-6674-52f2-8b04-6ac508d83651', '9bcac2bb-3f6f-5949-998b-837ee10f28f7', 'AT-EB-NAV-ONE', 'Navy', '#23304A', 'One Size', 0);
update public.inventory set quantity = 25 where variant_id = '67bfcadc-6674-52f2-8b04-6ac508d83651';

-- Woven Leather Tote
insert into public.products (id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, category_id, status, is_featured, is_new, popularity, published_at, created_at) values ('dd004829-d061-50c6-9e2f-231ca12d4775', 'woven-leather-tote', 'Woven Leather Tote', 'A structured top-handle bag combining hand-woven rattan with smooth vegetable-tanned leather. Turn-lock closure and a detachable strap.', array['Hand-woven rattan body', 'Vegetable-tanned leather', 'Turn-lock closure', 'Detachable shoulder strap']::text[], 'Rattan, 100% calf leather', 'Keep dry. Condition leather occasionally.', 'H 24 × W 28 × D 12 cm', 28500, null, '11d2c2c1-c1ff-5495-a6b0-83e50bd9030a', 'active', true, false, 62, now() - interval '161 days', now() - interval '161 days');
insert into public.product_images (product_id, url, alt, color_name, sort_order) values ('dd004829-d061-50c6-9e2f-231ca12d4775', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1600&q=80', 'Woven Leather Tote in cognac', 'Cognac', 0);
insert into public.product_collections (product_id, collection_id) values ('dd004829-d061-50c6-9e2f-231ca12d4775', '5c5a5715-0d35-5744-a937-c0be7a173817');
insert into public.product_variants (id, product_id, sku, color_name, color_hex, size, size_sort) values ('69e7e015-016d-50d8-875a-e7fec6a2ec2e', 'dd004829-d061-50c6-9e2f-231ca12d4775', 'AT-WLT-COG-ONE', 'Cognac', '#C8743F', 'One Size', 0);
update public.inventory set quantity = 17 where variant_id = '69e7e015-016d-50d8-875a-e7fec6a2ec2e';

insert into public.discount_codes (code, description, kind, value, min_subtotal_cents) values ('WELCOME10', '10% off your first order', 'percentage', 10, 0);
insert into public.discount_codes (code, description, kind, value, min_subtotal_cents) values ('ATELIER25', '€25 off orders over €200', 'fixed', 2500, 20000);

-- Seeding stock is not a customer movement; clear the log.
delete from public.inventory_movements;

commit;
