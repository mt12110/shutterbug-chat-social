
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Image, Video, Upload, X, MapPin, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onUploadComplete: () => void;
  onCancel: () => void;
}

const FileUpload = ({ onUploadComplete, onCancel }: FileUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [mood, setMood] = useState('');
  const [isDisappearing, setIsDisappearing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const bucket = selectedFile.type.startsWith('video/') ? 'videos' : 'posts';

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, selectedFile);

      if (uploadError) {
        toast({
          title: "Upload failed",
          description: uploadError.message,
          variant: "destructive"
        });
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Create post record
      const postData = {
        user_id: user.id,
        caption: caption.trim() || null,
        location: location.trim() || null,
        mood: mood.trim() || null,
        is_disappearing: isDisappearing,
        ...(selectedFile.type.startsWith('video/')
          ? { video_url: publicUrl }
          : { image_url: publicUrl })
      };

      const { error: postError } = await supabase
        .from('posts')
        .insert(postData);

      if (postError) {
        toast({
          title: "Failed to create post",
          description: postError.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Post created!",
        description: "Your post has been shared successfully"
      });

      onUploadComplete();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-purple-200 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Share a moment</h3>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* File Selection */}
          {!selectedFile ? (
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Image className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="p-3 bg-pink-100 rounded-full">
                    <Video className="w-6 h-6 text-pink-600" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    Upload photos or videos
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Share your moments with friends
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Preview */}
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                {selectedFile.type.startsWith('image/') ? (
                  <img
                    src={preview!}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <video
                    src={preview!}
                    className="w-full h-64 object-cover"
                    controls
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={3}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location"
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="How are you feeling?"
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Disappearing toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disappearing"
                  checked={isDisappearing}
                  onChange={(e) => setIsDisappearing(e.target.checked)}
                  className="rounded border-purple-300"
                />
                <label htmlFor="disappearing" className="text-sm text-gray-700">
                  Make this a disappearing post (24h)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={isUploading}
                >
                  {isUploading ? 'Sharing...' : 'Share Post'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
