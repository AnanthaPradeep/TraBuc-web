-- Sample destinations for local development and demos. Idempotent: safe to run more than once.
-- These are placeholder descriptions, so every row is verified = false (the app labels them "Sample data").
-- Image fields are intentionally left empty. Add image_url, image_credit and image_license only for
-- images whose licence you have checked. Set verified = true once you have reviewed a row's facts.

insert into public.destinations
  (slug, name, country, type, kind, budget, best_months, lat, lng, elevation, summary, highlights, verified)
values
  ('kyoto', 'Kyoto', 'Japan', 'City', 'popular', 'Mid-range', array[3, 4, 10, 11]::smallint[], 35.01, 135.77, 50,
   'Temples, tea houses and narrow lanes that reward slow walking.',
   array['Early-morning temple visits before the crowds', 'Day trip to the Arashiyama bamboo grove', 'Seasonal kaiseki dinners'], false),
  ('lofoten', 'Lofoten Islands', 'Norway', 'Island', 'popular', 'Premium', array[6, 7, 8, 2, 3]::smallint[], 68.21, 13.62, 5,
   'Sharp peaks rising straight out of the sea, with red fishing cabins below.',
   array['Midnight-sun hikes in summer', 'Northern lights season in late winter', 'Fishing-village stays'], false),
  ('cusco', 'Cusco', 'Peru', 'Mountains', 'popular', 'Mid-range', array[5, 6, 7, 8, 9]::smallint[], -13.53, -71.97, 3399,
   'A high-altitude Andean city and the usual base for the Sacred Valley.',
   array['Allow two days to adjust to altitude', 'Sacred Valley market towns', 'Multi-day trekking routes'], false),
  ('amalfi', 'Amalfi Coast', 'Italy', 'Coast', 'popular', 'Premium', array[5, 6, 9]::smallint[], 40.63, 14.6, 20,
   'Cliffside villages linked by winding coast roads and ferry hops.',
   array['Ferries between towns beat the road in summer', 'Path of the Gods walk', 'Lemon-grove lunches'], false),
  ('marrakech', 'Marrakech', 'Morocco', 'City', 'popular', 'Budget', array[3, 4, 5, 10, 11]::smallint[], 31.63, -8.0, 466,
   'A walled medina of souks, courtyards and rooftop cafés.',
   array['Evening in Jemaa el-Fnaa square', 'Riad stays in the medina', 'Day trips to the Atlas foothills'], false),
  ('banff', 'Banff National Park', 'Canada', 'Mountains', 'popular', 'Mid-range', array[6, 7, 8, 9, 1, 2]::smallint[], 51.18, -115.57, 1383,
   'Turquoise lakes and alpine trails with well-run campgrounds.',
   array['Lake-side campgrounds (book early)', 'Sunrise at Moraine Lake', 'Winter skiing'], false),
  ('socotra', 'Socotra', 'Yemen', 'Island', 'hidden', 'Premium', array[10, 11, 12, 1, 2, 3]::smallint[], 12.5, 53.9, 0,
   'Remote island known for unusual plants found almost nowhere else. Check current travel advisories before planning.',
   array['Dragon blood tree plateaus', 'Remote beach camping', 'Check government travel advice first'], false),
  ('faroe', 'Faroe Islands', 'Denmark', 'Island', 'hidden', 'Premium', array[6, 7, 8]::smallint[], 62.0, -6.79, 40,
   'Grass-roofed villages and waterfalls dropping into the Atlantic.',
   array['Village-to-village hiking', 'Ferry and tunnel road network', 'Fast-changing weather'], false),
  ('wadi-rum', 'Wadi Rum', 'Jordan', 'Desert', 'hidden', 'Budget', array[3, 4, 5, 10, 11]::smallint[], 29.57, 35.42, 900,
   'Red sandstone desert valleys with Bedouin-run camps under clear night skies.',
   array['Overnight desert camp', 'Jeep or camel tours', 'Stargazing'], false),
  ('plitvice', 'Plitvice Lakes', 'Croatia', 'Forest', 'hidden', 'Budget', array[4, 5, 9, 10]::smallint[], 44.88, 15.62, 600,
   'Terraced lakes joined by boardwalks through beech forest.',
   array['Arrive at opening to beat tour groups', 'Boardwalk loops of varied length', 'Autumn colours'], false),
  ('hokkaido-shiretoko', 'Shiretoko Peninsula', 'Japan', 'Forest', 'hidden', 'Mid-range', array[6, 7, 8, 9]::smallint[], 44.1, 145.1, 300,
   'Wild northern coastline with hot-spring streams and marine wildlife.',
   array['Coastal boat trips', 'Guided forest walks', 'Remote onsen'], false),
  ('gili-air', 'Gili Air', 'Indonesia', 'Island', 'hidden', 'Budget', array[5, 6, 7, 8, 9]::smallint[], -8.35, 116.08, 3,
   'A car-free island small enough to walk around in an hour or two.',
   array['Snorkelling off the beach', 'Bicycles and horse carts only', 'Sunset-side cafés'], false)
on conflict (slug) do update set
  name = excluded.name, country = excluded.country, type = excluded.type, kind = excluded.kind,
  budget = excluded.budget, best_months = excluded.best_months, lat = excluded.lat, lng = excluded.lng,
  elevation = excluded.elevation, summary = excluded.summary, highlights = excluded.highlights;
-- Note: image_* and verified are deliberately not overwritten, so re-running the seed never
-- discards content you curated in the dashboard.
