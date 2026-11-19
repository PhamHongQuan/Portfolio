import Admin from "./Admin";

export default function AdminPage() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return <main className="p-6">Chưa cấu hình Supabase: đặt <code>SUPABASE_URL</code> và <code>SUPABASE_ANON_KEY</code> rồi chạy lại.</main>;
  }
  return <Admin url={url} anonKey={anonKey} />;
}
