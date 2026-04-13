import TurnajCard from "./TurnajCard";

function TurnajList({ title, tournaments, search, selectedPeriod }) {
  const periodType =
    title === "Nadcházející turnaje" ? "Nadcházející" : "Proběhlé";

  const filtered = tournaments.filter((t) => {
    const matchesSearch = t.name?.toLowerCase().includes(search.toLowerCase());
    const matchesPeriod =
      selectedPeriod === "" || selectedPeriod === periodType;
    return matchesSearch && matchesPeriod;
  });

  if (!filtered.length) return null;

  return (
    <div className="mb-8">
      <div className="devider mb-4">{title.toLowerCase()}</div>
      <div className="flex flex-col gap-4">
        {filtered.map((t) => (
          <TurnajCard key={t.id} tournament={t} />
        ))}
      </div>
    </div>
  );
}

export default TurnajList;
