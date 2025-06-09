
import { useState } from 'react';
import { X, MapPin, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import FileUpload from './FileUpload';

interface CreatePostProps {
  onClose: () => void;
}

const CreatePost = ({ onClose }: CreatePostProps) => {
  const { user } = useAuth();
  const { createPost } = usePosts();
  const { toast } = useToast();
  
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [isDisappearing, setIsDisappearing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const bucket = file.type.startsWith('video/') ? 'videos' : 'images';

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!caption.trim() && !selectedFile) {
      toast({
        title: "Please add content",
        description: "Add a caption or select a file to share",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      let image_url = '';
      let video_url = '';

      if (selectedFile) {
        const uploadedUrl = await uploadFile(selectedFile);
        if (!uploadedUrl) {
          setUploading(false);
          return;
        }

        if (selectedFile.type.startsWith('video/')) {
          video_url = uploadedUrl;
        } else {
          image_url = uploadedUrl;
        }
      }

      const result = await createPost({
        caption: caption.trim() || undefined,
        image_url: image_url || undefined,
        video_url: video_url || undefined,
        location: location.trim() || undefined,
        is_disappearing: isDisappearing
      });

      if (!result.error) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-purple-100 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900">Create Post</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="min-h-[100px] border-purple-200 focus:border-purple-400"
        />

        <FileUpload
          onFileSelect={setSelectedFile}
          onRemove={() => setSelectedFile(null)}
          className="w-full"
        />

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Add location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border-purple-200 focus:border-purple-400"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <Label htmlFor="disappearing" className="text-sm font-medium">
              Disappearing post (24h)
            </Label>
          </div>
          <Switch
            id="disappearing"
            checked={isDisappearing}
            onCheckedChange={setIsDisappearing}
          />
        </div>

        {isDisappearing && (
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-md">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-700">
              This post will automatically disappear after 24 hours
            </span>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={uploading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {uploading ? 'Posting...' : 'Share Post'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
