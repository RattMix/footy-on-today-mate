
interface TeamCrestProps {
  name: string;
  crest: string;
}

const TeamCrest = ({ name, crest }: TeamCrestProps) => {
  return (
    <div className="text-center font-mono">
      {/* Basic team display */}
      <div className="mb-2">
        <div className="w-16 h-16 md:w-20 md:h-20 hokey-border bg-primary text-primary-foreground flex items-center justify-center mx-auto amateur-spacing">
          <span className="text-2xl md:text-3xl">{crest}</span>
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
