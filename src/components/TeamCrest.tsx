
interface TeamCrestProps {
  name: string;
  crest: string;
}

const TeamCrest = ({ name, crest }: TeamCrestProps) => {
  return (
    <div className="text-center">
      {/* Team Crest */}
      <div className="mb-4">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center mb-4 mx-auto border-4 border-gray-300">
          <span className="text-4xl md:text-6xl">{crest}</span>
        </div>
      </div>
      
      {/* Team Name */}
      <div className="text-xl md:text-3xl font-black uppercase tracking-wide">
        {name}
      </div>
    </div>
  );
};

export default TeamCrest;
