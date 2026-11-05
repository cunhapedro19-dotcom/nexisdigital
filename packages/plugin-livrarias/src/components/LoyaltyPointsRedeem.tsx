"use client";

import { Star, Minus, Plus, Info } from "lucide-react";
import { useState } from "react";

interface LoyaltyPointsRedeemProps {
  availablePoints: number;
  pointsRate: number; // pontos por real
  maxRedemptionPercent?: number; // % máximo do valor que pode ser pago com pontos
  onRedeem: (points: number) => void;
  redeemedPoints?: number;
}

export function LoyaltyPointsRedeem({
  availablePoints,
  pointsRate,
  maxRedemptionPercent = 100,
  onRedeem,
  redeemedPoints = 0,
}: LoyaltyPointsRedeemProps) {
  const [pointsToRedeem, setPointsToRedeem] = useState(redeemedPoints);
  const [showInfo, setShowInfo] = useState(false);

  const maxRedeemable = Math.min(availablePoints, Math.floor(10000 * pointsRate * (maxRedemptionPercent / 100)));
  const discountValue = pointsToRedeem * pointsRate;

  const handleRedeem = () => {
    if (pointsToRedeem > 0) {
      onRedeem(pointsToRedeem);
    }
  };

  const handleMax = () => {
    setPointsToRedeem(maxRedeemable);
  };

  return (
    <div className="card p-4 border-[var(--brand-amber)]/30 bg-[var(--brand-amber)]/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-[var(--brand-amber)] fill-[var(--brand-amber)]" />
          <span className="font-semibold text-[var(--text-primary)]">Pontos de Fidelidade</span>
          <button onClick={() => setShowInfo(!showInfo)} className="btn btn-ghost p-1"><Info className="w-4 h-4 text-[var(--text-muted)]" /></button>
        </div>
        <span className="font-bold text-[var(--brand-amber)]">{availablePoints} pts disponíveis</span>
      </div>

      {showInfo && (
        <div className="mb-4 p-3 bg-[var(--bg-primary)] rounded-lg text-sm text-[var(--text-secondary)]">
          <p>Cada {pointsRate} pontos = R$ 1,00 de desconto</p>
          <p>Você pode resgatar até {maxRedemptionPercent}% do valor do pedido com pontos</p>
          <p>Máximo resgatável agora: {maxRedeemable} pts ({new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(maxRedeemable * pointsRate / 100)})</p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="points-input" className="font-medium text-[var(--text-primary)]">
            Pontos a resgatar
          </label>
          <div className="flex items-center gap-2">
            <button onClick={() => setPointsToRedeem(Math.max(0, pointsToRedeem - pointsRate))} className="btn btn-ghost p-1.5 rounded" aria-label="Diminuir"><Minus className="w-4 h-4" /></button>
            <input
              id="points-input"
              type="number"
              min={0}
              max={maxRedeemable}
              step={pointsRate}
              value={pointsToRedeem}
              onChange={e => setPointsToRedeem(Math.min(maxRedeemable, Math.max(0, Number(e.target.value) || 0)))}
              className="w-24 text-center px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
            />
            <button onClick={() => setPointsToRedeem(Math.min(maxRedeemable, pointsToRedeem + pointsRate))} className="btn btn-ghost p-1.5 rounded" aria-label="Aumentar"><Plus className="w-4 h-4" /></button>
            <button onClick={handleMax} className="btn btn-ghost btn-sm text-xs">Máx</button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg">
          <span className="font-medium text-[var(--text-primary)]">Desconto</span>
          <span className="font-bold text-[var(--text-success)] text-lg">
            -{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(discountValue / 100)}
          </span>
        </div>

        {pointsToRedeem > 0 && (
          <button onClick={handleRedeem} className="btn btn-primary w-full">
            Aplicar {pointsToRedeem} pontos
          </button>
        )}

        {redeemedPoints > 0 && (
          <button onClick={() => onRedeem(0)} className="btn btn-outline w-full">
            Remover pontos
          </button>
        )}
      </div>
    </div>
  );
}