import PvpGame from "./pvp-game";

export default async function PvpGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PvpGame gameId={id} />;
}
