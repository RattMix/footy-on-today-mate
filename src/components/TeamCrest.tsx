
interface TeamCrestProps {
  name: string;
  crest: string;
}

const TeamCrest = ({ name, crest }: TeamCrestProps) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = '<div class="text-2xl">⚽</div>';
    }
  };

  return (
    <div className="text-center font-mono">
      {/* Basic team display */}
      <div className="mb-2">
        <div className="w-16 h-16 md:w-20 md:h-20 hokey-border bg-primary text-primary-foreground flex items-center justify-center mx-auto amateur-spacing">
          <img 
            src={crest} 
            alt={name}
            className="w-12 h-12 md:w-16 md:h-16 object-contain"
            onError={handleImageError}
          />
        </div>
      </div>
      
      {/* Team name - no fancy styling */}
      <div className="hokey-border bg-background amateur-spacing inline-block">
        <div className="text-xs md:text-sm font-bold clunky-text">
          {name}
        </div>
      </div>
    </div>
  );
};

export default TeamCrest;
