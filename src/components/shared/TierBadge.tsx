import { Badge } from "@/components/ui/badge";
import type { PlanName } from "@/types/tier";

const PLAN_ORDER: PlanName[] = ["essencial", "pro", "premium"];
const PLAN_EMOJI: Record<PlanName, string> = { essencial: "🌿", pro: "🚀", premium: "👑" };
const PLAN_LABEL: Record<PlanName, string> = { essencial: "Essencial", pro: "Pro", premium: "Premium" };

interface TierBadgeProps {
  currentPlan: PlanName;
  minimumPlan: PlanName;
  downgradeWarnings?: string[];
}

export function TierBadge({ currentPlan, minimumPlan, downgradeWarnings }: TierBadgeProps) {
  const needsUpgrade = PLAN_ORDER.indexOf(minimumPlan) > PLAN_ORDER.indexOf(currentPlan);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={needsUpgrade ? "outline" : "secondary"}>
          {PLAN_EMOJI[currentPlan]} Selecionado: {PLAN_LABEL[currentPlan]}
        </Badge>
        {needsUpgrade && (
          <Badge variant="default">
            {PLAN_EMOJI[minimumPlan]} Necessário: {PLAN_LABEL[minimumPlan]}
          </Badge>
        )}
      </div>
      {needsUpgrade && downgradeWarnings && downgradeWarnings.length > 0 && (
        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
          {downgradeWarnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
