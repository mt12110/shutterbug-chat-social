
import { Button } from "@/components/ui/button";

interface ProfileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ProfileNavigation = ({ activeTab, onTabChange }: ProfileNavigationProps) => {
  return (
    <div className="flex border-b border-border mb-6">
      <Button 
        variant="ghost" 
        className={`flex-1 ${activeTab === 'posts' ? 'border-b-2 border-primary text-primary' : ''}`}
        onClick={() => onTabChange('posts')}
      >
        Posts
      </Button>
      <Button 
        variant="ghost" 
        className={`flex-1 ${activeTab === 'tagged' ? 'border-b-2 border-primary text-primary' : ''}`}
        onClick={() => onTabChange('tagged')}
      >
        Tagged
      </Button>
    </div>
  );
};

export default ProfileNavigation;
