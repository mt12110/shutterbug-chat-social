
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon, Video, MapPin, Smile } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreatePostProps {
  onClose: () => void;
}

const CreatePost = ({ onClose }: CreatePostProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { createPost } = usePosts();
  const { toast } = useToast();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [mood, setMood] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    
    // Create preview URL
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const isVideo = file.type.startsWith('video/');
    const bucket = isVideo ? 'videos' : 'posts';
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast({
        title: "Upload failed",
        description: uploadError.message,
        variant: "destructive"
      });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!caption.trim() && !file) {
      toast({
        title: "Nothing to post",
        description: "Please add some content or select a file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      let fileUrl = null;
      if (file) {
        fileUrl = await uploadFile(file);
        if (!fileUrl) {
          setIsUploading(false);
          return;
        }
      }

      const postData = {
        caption: caption.trim() || undefined,
        location: location.trim() || undefined,
        mood: mood.trim() || undefined,
        [file?.type.startsWith('video/') ? 'video_url' : 'image_url']: fileUrl || undefined
      };

      const result = await createPost(postData);
      
      if (!result.error) {
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create Post</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.display_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="border-none bg-transparent resize-none focus:ring-0 text-lg placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* File Preview */}
          {previewUrl && (
            <div className="relative">
              {file?.type.startsWith('video/') ? (
                <video 
                  src={previewUrl} 
                  className="w-full h-64 object-cover rounded-lg"
                  controls
                />
              ) : (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Additional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="text-sm text-gray-600">Location</Label>
              <Input
                id="location"
                placeholder="Add location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="mood" className="text-sm text-gray-600">Mood</Label>
              <Input
                id="mood"
                placeholder="How are you feeling?"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button type="button" variant="ghost" size="sm" asChild>
                  <span>
                    <ImageIcon className="w-5 h-5 mr-1" />
                    Photo/Video
                  </span>
                </Button>
              </label>
            </div>
            
            <Button
              type="submit"
              disabled={isUploading || (!caption.trim() && !file)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isUploading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
