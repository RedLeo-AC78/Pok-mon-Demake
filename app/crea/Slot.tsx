export default function Slot(props: any) {
  return (
    <>
      <div>
        <label>Pokémon slot {props.slotNumber}</label>
        <input
          list="pokemon-list"
          className="w-32 px-2 py-1 text-black rounded"
          placeholder="Rechercher…"
          value={props.slot}
          onChange={(e) => props.updateSlot(e.target.value, props.slotNumber)}
        />
      </div>
    </>
  );
}
