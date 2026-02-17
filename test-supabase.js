import { createClient } from '@supabase/supabase-js';

// Load credentials from .env.local
const supabaseUrl = 'https://api.labs-schickeria.com';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcwMDQ5MTM2LCJleHAiOjIwODU0MDkxMzZ9.OSn9HTDjkqhbwv_OgUW8P4sVML_NnvQDDHfq6FwopEU';

console.log('🔍 Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

async function testConnection() {
    try {
        console.log('\n1️⃣ Testing auth.getSession()...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.error('❌ Session Error:', sessionError.message);
        } else {
            console.log('✅ Session check successful');
            console.log('   Session:', sessionData.session ? 'Active' : 'None');
        }

        console.log('\n2️⃣ Testing database query (profiles table)...');
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .limit(5);

        if (profilesError) {
            console.error('❌ Profiles Query Error:', profilesError.message);
            console.error('   Details:', profilesError);
        } else {
            console.log('✅ Profiles query successful');
            console.log('   Found', profiles?.length || 0, 'profiles');
            if (profiles && profiles.length > 0) {
                console.log('   Sample:', profiles[0]);
            }
        }

        console.log('\n3️⃣ Testing generated_images table...');
        const { data: images, error: imagesError } = await supabase
            .from('generated_images')
            .select('id, prompt, created_at')
            .limit(5);

        if (imagesError) {
            console.error('❌ Images Query Error:', imagesError.message);
        } else {
            console.log('✅ Images query successful');
            console.log('   Found', images?.length || 0, 'images');
        }

        console.log('\n4️⃣ Testing generated_videos table...');
        const { data: videos, error: videosError } = await supabase
            .from('generated_videos')
            .select('id, prompt, created_at')
            .limit(5);

        if (videosError) {
            console.error('❌ Videos Query Error:', videosError.message);
        } else {
            console.log('✅ Videos query successful');
            console.log('   Found', videos?.length || 0, 'videos');
        }

        console.log('\n5️⃣ Testing generated_thumbnails table...');
        const { data: thumbnails, error: thumbnailsError } = await supabase
            .from('generated_thumbnails')
            .select('id, prompt, created_at')
            .limit(5);

        if (thumbnailsError) {
            console.error('❌ Thumbnails Query Error:', thumbnailsError.message);
        } else {
            console.log('✅ Thumbnails query successful');
            console.log('   Found', thumbnails?.length || 0, 'thumbnails');
        }

        console.log('\n✨ Connection test complete!');
    } catch (error) {
        console.error('\n💥 Unexpected error:', error);
    }
}

testConnection();
