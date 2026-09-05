import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export async function uploadScreenshot(file: File, userId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    const { error } = await supabase.storage.from('screenshots').upload(fileName, file);
    if (error) throw error;
    
    const { data } = supabase.storage.from('screenshots').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}
