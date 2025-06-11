
interface TeamCrestProps {
  name: string;
  crest: string;
}

const TeamCrest = ({ name, crest }: TeamCrestProps) => {
  return (
    <div className="text-center font-mono">
      {/* Team Crest */}
      <div className="mb-3">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-2 border-white flex items-center justify-center mx-auto">
          <span className="text-3xl md:text-4xl">{crest}</span>
        </div>
      </div>
      
      {/* Team Name */}
      <div className="border border-white bg-black px-2 py-1 inline-block">
        <div className="text-sm md:text-lg font-bold uppercase tracking-wider">
          {name}
        </div>
      </div>
    </div>
  );
};

export default TeamCrest;
