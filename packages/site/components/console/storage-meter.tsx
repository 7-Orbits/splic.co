import { formatBytes } from "@/lib/console/format";
import { UsageMeter } from "./usage-meter";

interface StorageMeterProps {
  usedBytes: number;
  allowanceBytes: number;
  className?: string;
}

export function StorageMeter({
  usedBytes,
  allowanceBytes,
  className = "",
}: StorageMeterProps) {
  const remaining = Math.max(0, allowanceBytes - usedBytes);

  return (
    <UsageMeter
      label="Cloud storage"
      value={usedBytes}
      max={allowanceBytes}
      valueLabel={`${formatBytes(usedBytes)} of ${formatBytes(allowanceBytes)}`}
      caption={`${formatBytes(remaining)} remaining`}
      tone="secondary"
      className={className}
    />
  );
}
