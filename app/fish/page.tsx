export default function FishPage() {
  // [Existing code...]

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="fixed top-10 left-1/3 w-1/3 h-4 bg-gray-300 border border-black rounded-xl z-10">
        <div
          className="bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 h-full rounded-xl"
          style={{
            width: `${(unlocked.length / species.length) * 100}%`, // Progress percentage
          }}
        ></div>
      </div>

      {/* Species Cards */}
      <div className="p-4 grid grid-cols-4 gap-4 mt-16">
        {species
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(fish => {
            const isUnlocked = unlocked.includes(fish.id)
            return (
              <div
                key={fish.id}
                onClick={() => toggleUnlock(fish.id)}
                className={`cursor-pointer border rounded p-4 flex flex-col items-center transition-all duration-300
                  ${isUnlocked ? 'bg-white' : 'bg-black'}
                  ${isUnlocked ? 'text-black' : 'text-white'}
                  ${isUnlocked ? 'scale-100' : 'scale-90'}
                `}
              >
                <img
                  src={fish.image_url}
                  alt={fish.name}
                  className={`w-full aspect-square object-cover mb-2 transition-all duration-300 
                    ${isUnlocked ? 'filter-none' : 'grayscale'}
                    ${isUnlocked ? 'scale-100' : 'scale-90'}
                  `}
                />
                <h2 className="font-bold text-center">{fish.name}</h2>
                <p className="text-sm italic text-center">{fish.scientific_name}</p>

                {isUnlocked && (
                  <div className="relative">
                    {/* Info Icon */}
                    <span
                      className="cursor-pointer text-xl absolute top-2 right-2 text-blue-500"
                      title="Click for description"
                    >
                      ℹ️
                    </span>

                    {/* Tooltip with description */}
                    <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-90 p-4 text-black rounded opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <p className="text-xs text-center mt-2">{fish.description}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
