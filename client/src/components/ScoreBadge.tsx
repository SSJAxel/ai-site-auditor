import { scoreClass, scoreLabel } from "../lib/scores";

interface Props {
  label: string;
  score: number | null | undefined;
}

export function ScoreBadge({ label, score }: Props) {
  return (
    <div className={`score-badge ${scoreClass(score)}`}>
      <span className="score-value">{scoreLabel(score)}</span>
      <span className="score-label">{label}</span>
    </div>
  );
}
