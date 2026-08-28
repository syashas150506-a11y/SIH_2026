import os
from app.config import SUPABASE_URL, SUPABASE_KEY

_supabase_client = None


def get_supabase():
    global _supabase_client
    if _supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            return None
        from supabase import create_client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase_client


def upload_to_supabase_storage(bucket_name: str, file_path: str, destination_name: str) -> str:
    """
    Uploads a local file to Supabase Storage bucket and returns its public URL.
    Returns local path if Supabase credentials or client are not configured.
    """
    supabase = get_supabase()
    if not supabase:
        return file_path

    try:
        with open(file_path, "rb") as f:
            supabase.storage.from_(bucket_name).upload(
                path=destination_name,
                file=f,
                file_options={"cache-control": "3600", "upsert": "true"}
            )
        public_url = supabase.storage.from_(bucket_name).get_public_url(destination_name)
        return public_url
    except Exception as e:
        print(f"Supabase Storage Upload Warning: {e}")
        return file_path
