import { openDatabase, list, settings } from '../server/db.js';
import { supabaseAdmin, isSupabaseAdminConfigured } from '../server/supabase.js';

if (!isSupabaseAdminConfigured) {
  console.error('❌ Supabase is not configured. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
  process.exit(1);
}

async function migrate() {
  console.log('🚀 Starting SQLite to Supabase Migration...');
  const db = openDatabase();

  try {
    // 1. Migrate Categories
    const localCategories = list(db, 'categories');
    console.log(`📦 Found ${localCategories.length} categories in SQLite.`);

    const formattedCategories = localCategories.map(c => ({
      id: String(c.id),
      slug: c.slug,
      name: c.name,
      bengali_name: c.bengaliName || null,
      hindi_name: c.hindiName || null,
      short_desc: c.shortDesc || null,
      tagline: c.tagline || null,
      image: c.image || null,
      icon_name: c.iconName || 'ShoppingBag',
      banner_gradient: c.bannerGradient || null,
      archived: Boolean(c.archived),
      subcategories: c.subcategories || [],
    }));

    const { error: catError } = await supabaseAdmin
      .from('categories')
      .upsert(formattedCategories, { onConflict: 'slug' });

    if (catError) {
      if (catError.message.includes('relation "public.categories" does not exist') || catError.message.includes('schema cache')) {
        console.error('\n⚠️  Supabase tables have not been created yet!');
        console.error('👉 Please copy the SQL from "supabase/schema.sql" and run it in your Supabase Dashboard:');
        console.error('   Supabase Dashboard ➔ SQL Editor ➔ New query ➔ Paste & Run\n');
        process.exit(1);
      }
      throw catError;
    }
    console.log(`✅ Successfully migrated ${formattedCategories.length} categories to Supabase.`);

    // 2. Migrate Products
    const localProducts = list(db, 'products');
    console.log(`🛍️ Found ${localProducts.length} products in SQLite.`);

    const formattedProducts = localProducts.map(p => ({
      id: String(p.id),
      name: p.name,
      slug: p.slug || null,
      category: p.category || null,
      price: Number(p.price) || 0,
      old_price: p.oldPrice ? Number(p.oldPrice) : null,
      stock: Number(p.stock) || 0,
      weight: p.weight || null,
      description: p.description || null,
      images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
      price_pending: Boolean(p.pricePending),
      archived: Boolean(p.archived),
      revision: p.revision || null,
    }));

    // Batch upsert products in chunks of 50 to avoid payload limits
    const CHUNK_SIZE = 50;
    for (let i = 0; i < formattedProducts.length; i += CHUNK_SIZE) {
      const chunk = formattedProducts.slice(i, i + CHUNK_SIZE);
      const { error: prodError } = await supabaseAdmin
        .from('products')
        .upsert(chunk, { onConflict: 'id' });
      if (prodError) throw prodError;
    }
    console.log(`✅ Successfully migrated ${formattedProducts.length} products to Supabase.`);

    // 3. Migrate Settings
    const localSettings = settings(db);
    if (localSettings) {
      const formattedSettings = {
        id: 1,
        delivery_fee: Number(localSettings.deliveryFee) || 10,
        minimum_order: Number(localSettings.minimumOrder) || 0,
        service_pincodes: localSettings.servicePincodes || ['712701'],
        accepting_orders: localSettings.acceptingOrders !== false,
        store_details: localSettings,
      };

      const { error: settingsError } = await supabaseAdmin
        .from('store_settings')
        .upsert(formattedSettings, { onConflict: 'id' });

      if (settingsError) throw settingsError;
      console.log('✅ Successfully migrated store settings to Supabase.');
    }

    console.log('\n🎉 ALL DATA MIGRATED SUCCESSFULLY TO SUPABASE! 🎉\n');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    db.close();
  }
}

migrate();
